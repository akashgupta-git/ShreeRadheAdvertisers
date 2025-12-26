import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mediaLocations, mediaTypes } from "@/lib/data";
import { CalendarDays, Check, X, Wrench, Search, Filter } from "lucide-react";

const Availability = () => {
  const [selectedMedia, setSelectedMedia] = useState<string>('');
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
  // New State for Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Filter logic
  const filteredMedia = useMemo(() => {
    return mediaLocations.filter(media => {
      const matchesSearch = 
        media.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        media.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        media.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'All' || media.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [searchQuery, typeFilter]);

  const handleApplyStatus = () => {
    // Mock action
    console.log('Applying status:', selectedStatus, 'to dates:', selectedDates);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Availability Management</h1>
        <p className="text-muted-foreground">Manage booking dates and availability for media locations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Media Selection */}
        <Card className="p-6 bg-card border-border/50">
          <h3 className="font-semibold mb-4">Select Media</h3>
          
          {/* SEARCH & FILTERS */}
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, city, ID..." 
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Filter by Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <Filter className="w-3 h-3 mr-2 opacity-50" />
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  {mediaTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Media Location</Label>
            <Select value={selectedMedia} onValueChange={setSelectedMedia}>
              <SelectTrigger>
                <SelectValue placeholder="Choose media location" />
              </SelectTrigger>
              <SelectContent>
                {filteredMedia.length > 0 ? (
                  filteredMedia.slice(0, 50).map(media => (
                    <SelectItem key={media.id} value={media.id}>
                      {media.name} <span className="text-muted-foreground text-xs ml-1">({media.id})</span>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground text-center">No media found</div>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground text-right">
              {filteredMedia.length} locations found
            </p>
          </div>

          {selectedMedia && (
            <div className="mt-6 p-4 rounded-lg bg-muted/50 animate-fade-in">
              {(() => {
                const media = mediaLocations.find(m => m.id === selectedMedia);
                if (!media) return null;
                return (
                  <div className="space-y-2 text-sm">
                    <div className="font-medium">{media.name}</div>
                    <div className="text-muted-foreground">{media.city}, {media.state}</div>
                    <Badge variant={
                      media.status === 'Available' ? 'default' : 
                      media.status === 'Booked' ? 'destructive' : 'secondary'
                    } className={
                       media.status === 'Available' ? 'bg-green-600 hover:bg-green-700' : 
                       media.status === 'Coming Soon' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : ''
                    }>
                      {media.status}
                    </Badge>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-medium">Status Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-600" />
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-destructive" />
                <span className="text-sm">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500" />
                <span className="text-sm">Coming Soon</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Calendar */}
        <Card className="lg:col-span-2 p-6 bg-card border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Select Dates
            </h3>
          </div>

          <div className="flex justify-center border rounded-lg p-4">
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={setSelectedDates}
              numberOfMonths={2}
              className="rounded-lg"
            />
          </div>

          {selectedDates && selectedDates.length > 0 && (
            <div className="mt-6 p-4 rounded-lg bg-muted/50 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">{selectedDates.length} date(s) selected</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDates([])}>
                  Clear
                </Button>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium">Mark as:</div>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={selectedStatus === 'Available' ? 'default' : 'outline'}
                    size="sm"
                    className={selectedStatus === 'Available' ? 'bg-green-600 hover:bg-green-700' : 'hover:border-green-600 hover:text-green-600'}
                    onClick={() => setSelectedStatus('Available')}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Available
                  </Button>
                  <Button 
                    variant={selectedStatus === 'Booked' ? 'default' : 'outline'}
                    size="sm"
                    className={selectedStatus === 'Booked' ? 'bg-destructive hover:bg-destructive/90' : 'hover:border-destructive hover:text-destructive'}
                    onClick={() => setSelectedStatus('Booked')}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Booked
                  </Button>
                  <Button 
                    variant={selectedStatus === 'Coming Soon' ? 'default' : 'outline'}
                    size="sm"
                    className={selectedStatus === 'Coming Soon' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'hover:border-yellow-500 hover:text-yellow-600'}
                    onClick={() => setSelectedStatus('Coming Soon')}
                  >
                    <Wrench className="h-4 w-4 mr-1" />
                    Coming Soon
                  </Button>
                </div>

                {selectedStatus && (
                  <Button className="w-full mt-4" onClick={handleApplyStatus}>
                    Apply Status
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Availability;