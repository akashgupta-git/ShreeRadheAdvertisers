import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MapPin } from "lucide-react"; 
import { useNavigate } from "react-router-dom"; 
import { MediaTable } from "@/components/admin/MediaTable";
import { mediaLocations, mediaTypes, type MediaLocation } from "@/lib/data";
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
import { PlusCircle, Download } from "lucide-react"; 
import { useRecycleBin } from "@/contexts/RecycleBinContext";
import { useLocationData } from "@/contexts/LocationDataContext";
import { LocationManagementDialog } from "@/components/admin/LocationManagement";

const MediaManagement = () => {
  const navigate = useNavigate();
  const { addToRecycleBin, getItemsByType } = useRecycleBin();
  const { activeState, districts } = useLocationData();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  
  // State for all media items
  const [allMedia, setAllMedia] = useState<MediaLocation[]>(mediaLocations);

  // State for Soft Delete Confirmation
  const [itemToDelete, setItemToDelete] = useState<MediaLocation | null>(null);

  // Get deleted media IDs from centralized bin
  const deletedMediaIds = new Set(getItemsByType('media').map(item => item.id));

  // Soft Delete - Move to centralized bin
  const handleSoftDelete = () => {
    if (!itemToDelete) return;
    
    addToRecycleBin({
      id: itemToDelete.id,
      type: 'media',
      displayName: itemToDelete.name,
      subText: `${itemToDelete.city}, ${itemToDelete.district}`,
      originalData: itemToDelete,
    });
    
    setAllMedia(prev => prev.filter(item => item.id !== itemToDelete.id));
    
    toast({ 
      title: "Moved to Recycle Bin", 
      description: "Item will be permanently deleted in 30 days." 
    });
    setItemToDelete(null);
  };

  // Filter Logic: Exclude items in recycle bin
  const filteredMedia = allMedia.filter((media) => {
    if (deletedMediaIds.has(media.id)) return false;

    const matchesSearch = 
      media.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      media.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      media.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDistrict = districtFilter === "all" || media.district === districtFilter;
    const matchesType = typeFilter === "all" || media.type === typeFilter;
    const matchesStatus = statusFilter === "all" || media.status === statusFilter;

    return matchesSearch && matchesDistrict && matchesType && matchesStatus;
  });

  // Handle delete button click - find the media item first
  const handleDeleteClick = (id: string) => {
    const media = allMedia.find(m => m.id === id);
    if (media) {
      setItemToDelete(media);
    }
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
          <CardDescription>Refine your media search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, city, ID..."
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
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Booked">Booked</SelectItem>
                <SelectItem value="Coming Soon">Coming Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <MediaTable 
            data={filteredMedia} 
            onDelete={handleDeleteClick} 
          />
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Soft Delete */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Recycle Bin?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{itemToDelete?.name}" from the active list. 
              You can restore it within 30 days from the Recycle Bin (accessible from the header).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSoftDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Move to Bin
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
