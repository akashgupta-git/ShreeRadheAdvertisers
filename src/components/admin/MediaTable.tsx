/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { states, districts, mediaTypes } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Edit, Trash2, Search, ChevronLeft, ChevronRight, Power } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MediaLocation } from "@/lib/api/types";

// Updated interface to match the props passed from MediaManagement
interface MediaTableProps {
  data: MediaLocation[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
}

export function MediaTable({ data, onDelete, onEdit, onToggleStatus }: MediaTableProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const availableDistricts = stateFilter && stateFilter !== 'all' ? districts[stateFilter] || [] : [];

  // Local filtering logic for search and pagination
  const filteredMedia = data.filter(media => {
    const matchesSearch = search === '' || 
      media.name.toLowerCase().includes(search.toLowerCase()) ||
      (media._id || media.id).toLowerCase().includes(search.toLowerCase()) ||
      media.city.toLowerCase().includes(search.toLowerCase());
    
    const matchesState = stateFilter === 'all' || media.state === stateFilter;
    const matchesDistrict = districtFilter === 'all' || media.district === districtFilter;
    const matchesType = typeFilter === 'all' || media.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || media.status === statusFilter;

    return matchesSearch && matchesState && matchesDistrict && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredMedia.length / itemsPerPage);
  const paginatedMedia = filteredMedia.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusVariant = (status: string) => {
    if (status === 'Available') return 'success';
    if (status === 'Booked') return 'destructive';
    if (status === 'Maintenance') return 'warning';
    return 'secondary';
  };

  return (
    <div className="space-y-4">
      {/* Search and Secondary Filters (Local) */}
      <div className="flex flex-wrap gap-3 p-4 bg-muted/20 rounded-t-lg border-b">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search within these results..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px] bg-background">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {mediaTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Booked">Booked</SelectItem>
            <SelectItem value="Coming Soon">Coming Soon</SelectItem>
            <SelectItem value="Maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[100px] pl-6">ID</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>City / District</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {paginatedMedia.map((media) => {
              // Use _id from backend or fallback to id from static data
              const itemId = media._id || media.id;
              if (!itemId) return null; // Skip items without valid ID
              return (
                <TableRow key={itemId} className="hover:bg-muted/10 group">
                  <TableCell className="font-mono text-[10px] pl-6 text-muted-foreground">
                    {/* #{itemId.substring(0, 8)} */}
                    {media.id}
                  </TableCell>
                  <TableCell className="font-semibold text-sm">{media.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {media.city}, {media.district}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-medium">{media.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(media.status)} className="text-[10px] font-bold">
                      {media.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6">
                    <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => navigate(`/admin/media/${itemId}`)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-orange-500 hover:bg-orange-50 hover:text-orange-600" 
                        onClick={() => onToggleStatus(itemId, media.status)}
                        title="Toggle Maintenance"
                      >
                        <Power className="h-4 w-4" />
                      </Button>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-primary hover:bg-primary/5" 
                        onClick={() => onEdit(itemId)}
                        title="Edit Media"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(itemId);
                        }}
                        title="Delete Media"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginatedMedia.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">
                  No matching media records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/10">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-bold">{filteredMedia.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold">{Math.min(currentPage * itemsPerPage, filteredMedia.length)}</span> of <span className="font-bold">{filteredMedia.length}</span> billboards
        </p>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="h-8 px-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => p + 1)}
              className="h-8 px-2"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <span className="text-[10px] font-black uppercase text-muted-foreground">
            Page {currentPage} of {totalPages || 1}
          </span>
        </div>
      </div>
    </div>
  );
}