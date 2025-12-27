/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MapPin, PlusCircle, Download, Loader2 } from "lucide-react"; 
import { useNavigate } from "react-router-dom"; 
import { MediaTable } from "@/components/admin/MediaTable";
import { mediaTypes } from "@/lib/data"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { useLocationData } from "@/contexts/LocationDataContext";
import { LocationManagementDialog } from "@/components/admin/LocationManagement";

// Live API Hooks and Types
import { useMedia, useDeleteMedia, useUpdateMedia } from "@/hooks/api/useMedia";
import { MediaLocation, MediaType, MediaStatus } from "@/lib/api/types";

const MediaManagement = () => {
  const navigate = useNavigate();
  const { activeState, districts } = useLocationData();
  
  // State for Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  
  // State for Soft Delete Confirmation
  const [itemToDelete, setItemToDelete] = useState<MediaLocation | null>(null);

  // 1. Fetch Live Data from Backend
  const { data: mediaResponse, isLoading, isError } = useMedia({
    state: activeState,
    district: districtFilter === "all" ? undefined : districtFilter,
    // Cast string filter to MediaType union type to avoid TS errors
    type: typeFilter === "all" ? undefined : (typeFilter as MediaType),
    status: statusFilter === "all" ? undefined : (statusFilter as MediaStatus),
    search: searchQuery || undefined
  });

  // 2. Mutations
  const deleteMedia = useDeleteMedia();
  const updateMedia = useUpdateMedia();

  // Soft Delete - Move to live recycle bin on backend
  const handleSoftDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      // Use _id from backend or id from static data
      const deleteId = itemToDelete._id || itemToDelete.id;
      if (!deleteId) {
        throw new Error('Invalid media item - missing ID');
      }
      await deleteMedia.mutateAsync(deleteId);
      toast({ 
        title: "Moved to Recycle Bin", 
        description: "The media location has been deactivated and moved to the bin." 
      });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to delete the media item.",
        variant: "destructive"
      });
    } finally {
      setItemToDelete(null);
    }
  };

  const handleStatusToggle = (id: string, currentStatus: string) => {
    if (!id) {
      toast({ title: "Error", description: "Invalid media ID", variant: "destructive" });
      return;
    }
    const nextStatus = currentStatus === 'Available' ? 'Maintenance' : 'Available';
    updateMedia.mutate({ id, data: { status: nextStatus as MediaStatus } });
  };

  const handleEdit = (id: string) => {
    if (!id) {
      toast({ title: "Error", description: "Invalid media ID", variant: "destructive" });
      return;
    }
    navigate(`/admin/media/edit/${id}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Media Management</h1>
          <p className="text-muted-foreground">Manage all your outdoor advertising media locations</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setLocationDialogOpen(true)}>
            <MapPin className="h-4 w-4 mr-2" />
            Manage Locations
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button onClick={() => navigate('/admin/media/new')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Media
          </Button>
        </div>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filters
          </CardTitle>
          <CardDescription>Refine your live media search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, city..."
                className="pl-9 bg-background/50 border-gray-200 focus:border-primary/50 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger className="bg-background/50"><SelectValue placeholder="District" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts ({activeState})</SelectItem>
                {districts.map((d: string) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-background/50"><SelectValue placeholder="Media Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {mediaTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-background/50"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Booked">Booked</SelectItem>
                <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm overflow-hidden min-h-[400px]">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse font-medium">Fetching live billboards...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-destructive">
              <p>Failed to load media from backend.</p>
              <Button variant="link" onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : (
            <MediaTable 
              // Cast to any to bridge potential internal MediaTable prop definition gaps
              data={(mediaResponse?.data || []) as any} 
              onDelete={(id) => {
                const item = mediaResponse?.data.find(m => m._id === id);
                if (item) setItemToDelete(item);
              }}
              onEdit={handleEdit}
              onToggleStatus={handleStatusToggle}
            />
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Soft Delete */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Recycle Bin?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{itemToDelete?.name}" from the active list. 
              The backend will store it in the recycle bin for 30 days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSoftDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMedia.isPending}
            >
              {deleteMedia.isPending ? "Moving..." : "Move to Bin"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LocationManagementDialog 
        open={locationDialogOpen} 
        onOpenChange={setLocationDialogOpen} 
      />
    </div>
  );
};

export default MediaManagement;