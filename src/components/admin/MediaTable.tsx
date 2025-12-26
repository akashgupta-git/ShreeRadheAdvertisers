import { useState } from "react";
import { MediaLocation, states, districts, mediaTypes } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Edit, Calendar, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MediaTableProps {
  data: MediaLocation[];
  onDelete: (id: string) => void;
}

export function MediaTable({ data, onDelete }: MediaTableProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const availableDistricts = stateFilter && stateFilter !== 'all' ? districts[stateFilter] || [] : [];

  const filteredMedia = data.filter(media => {
    const matchesSearch = search === '' || 
      media.name.toLowerCase().includes(search.toLowerCase()) ||
      media.id.toLowerCase().includes(search.toLowerCase()) ||
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
    return 'warning';
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by ID, name, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={stateFilter} onValueChange={(v) => { setStateFilter(v); setDistrictFilter('all'); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={districtFilter} onValueChange={setDistrictFilter} disabled={stateFilter === 'all'}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="District" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {availableDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {mediaTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Booked">Booked</SelectItem>
            <SelectItem value="Coming Soon">Coming Soon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Media ID</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>City / District</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMedia.map((media) => (
              <TableRow key={media.id} className="hover:bg-muted/30">
                <TableCell className="font-mono text-sm">{media.id}</TableCell>
                <TableCell className="font-medium">{media.name}</TableCell>
                <TableCell className="text-muted-foreground">{media.city}, {media.district}</TableCell>
                <TableCell className="text-muted-foreground">{media.state}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{media.type}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(media.status)}>{media.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/media/${media.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(media.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginatedMedia.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No media found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredMedia.length)} of {filteredMedia.length} results
        </p>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm px-3">Page {currentPage} of {totalPages}</span>
          <Button 
            variant="outline" 
            size="icon"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}