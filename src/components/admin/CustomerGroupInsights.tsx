import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { type Customer, getBookingsByCustomerId } from "@/lib/data";
import { Users, Briefcase, TrendingUp, Wallet, ArrowRight, ArrowLeft, Calendar, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CustomerGroupInsightsProps {
  customers: Customer[];
}

export function CustomerGroupInsights({ customers }: CustomerGroupInsightsProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // 1. Aggregate data by group
  const groupStats = useMemo(() => {
    const stats: Record<string, { count: number; bookings: number; revenue: number }> = {};
    let totalRev = 0;

    customers.forEach(c => {
      const groupName = c.group || "Uncategorized";
      if (!stats[groupName]) {
        stats[groupName] = { count: 0, bookings: 0, revenue: 0 };
      }
      stats[groupName].count += 1;
      stats[groupName].bookings += c.totalBookings;
      stats[groupName].revenue += c.totalSpent;
      totalRev += c.totalSpent;
    });

    return Object.entries(stats)
      .map(([name, data]) => ({ name, ...data, percent: totalRev > 0 ? (data.revenue / totalRev) * 100 : 0 }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [customers]);

  const topGroup = groupStats[0];

  // 2. Get specific customers for the clicked group
  const groupCustomers = useMemo(() => {
    if (!selectedGroup) return [];
    return customers
      .filter(c => (c.group || "Uncategorized") === selectedGroup)
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [customers, selectedGroup]);

  // 3. Get bookings for the selected customer (Drill Down)
  const customerBookings = useMemo(() => {
    if (!selectedCustomer) return [];
    return getBookingsByCustomerId(selectedCustomer.id);
  }, [selectedCustomer]);

  // Handle Reset
  const handleClose = (open: boolean) => {
    if (!open) {
      setSelectedGroup(null);
      setSelectedCustomer(null);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Main Header */}
      <div className="flex items-center justify-between">
        <div>
           <h3 className="text-lg font-semibold">Customer Groups</h3>
           <p className="text-sm text-muted-foreground">Performance breakdown by client sector</p>
        </div>
        {topGroup && (
            <div className="flex items-center gap-2 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                <TrendingUp className="h-4 w-4" />
                Top Sector: <strong>{topGroup.name}</strong>
            </div>
        )}
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {groupStats.map((group) => (
          <Card 
            key={group.name} 
            className="overflow-hidden hover:shadow-md transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-primary group relative"
            onClick={() => setSelectedGroup(group.name)}
          >
             <div className="h-1 w-full bg-primary/10">
                 <div className="h-full bg-primary" style={{ width: `${group.percent}%` }} />
             </div>
             <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <h4 className="font-semibold text-lg">{group.name}</h4>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        {group.percent.toFixed(1)}% Share
                    </span>
                </div>
                
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-muted-foreground">
                            <Users className="h-4 w-4 mr-2" /> Clients
                        </span>
                        <span className="font-medium">{group.count}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-muted-foreground">
                            <Briefcase className="h-4 w-4 mr-2" /> Bookings
                        </span>
                        <span className="font-medium">{group.bookings}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                        <span className="flex items-center text-muted-foreground">
                            <Wallet className="h-4 w-4 mr-2" /> Revenue
                        </span>
                        <span className="font-bold text-primary">₹{(group.revenue / 100000).toFixed(1)}L</span>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t text-xs text-center text-primary opacity-60 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    View Analysis <ArrowRight className="h-3 w-3" />
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      {/* Dynamic Drill-Down Dialog */}
      <Dialog open={!!selectedGroup} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          
          <DialogHeader className="pb-4 border-b">
            {selectedCustomer ? (
              // === LEVEL 2: CUSTOMER DETAILS HEADER ===
              <div className="flex items-start gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedCustomer(null)} 
                  className="mt-1"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                 <div>
                   {/* Company Name is Main Title */}
                   <DialogTitle className="text-xl">{selectedCustomer.company}</DialogTitle>
                   <DialogDescription className="flex items-center gap-2 mt-1">
                     <Badge variant="outline" className="text-xs">{selectedGroup}</Badge>
                     <span>•</span>
                     <span>{selectedCustomer.phone}</span>
                   </DialogDescription>
                 </div>
               </div>
            ) : (
              // === LEVEL 1: GROUP LIST HEADER ===
              <div>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Users className="h-5 w-5 text-primary" />
                  {selectedGroup} Sector Analysis
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Showing {groupCustomers.length} clients sorted by total revenue contribution.
                </DialogDescription>
              </div>
            )}
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4 -mr-4">
            {selectedCustomer ? (
              // === LEVEL 2: CUSTOMER BOOKINGS TABLE ===
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-3 gap-4">
                   <div className="bg-muted/30 p-4 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground uppercase">Total Spent</p>
                      <p className="text-2xl font-bold text-primary mt-1">₹{(selectedCustomer.totalSpent / 100000).toFixed(2)}L</p>
                   </div>
                   <div className="bg-muted/30 p-4 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground uppercase">Total Bookings</p>
                      <p className="text-2xl font-bold mt-1">{selectedCustomer.totalBookings}</p>
                   </div>
                   <div className="bg-muted/30 p-4 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground uppercase">Active Campaigns</p>
                      <p className="text-2xl font-bold text-success mt-1">
                        {customerBookings.filter(b => b.status === 'active' || b.status === 'Active').length}
                      </p>
                   </div>
                </div>

                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Media Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{booking.media?.name || booking.mediaId}</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {booking.media?.city || 'Unknown City'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{booking.media?.type || 'Media'}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground flex flex-col">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {booking.startDate}
                              </span>
                              <span className="text-xs ml-4">to {booking.endDate}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                booking.status.toLowerCase() === 'active' ? 'success' : 
                                booking.status.toLowerCase() === 'completed' ? 'secondary' : 
                                'outline'
                              }
                              className="capitalize"
                            >
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{booking.amount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      {customerBookings.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No booking history found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              // === LEVEL 1: GROUP CUSTOMER LIST ===
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead className="text-center">Bookings</TableHead>
                    <TableHead className="text-right">Total Revenue</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No clients found in this group.
                      </TableCell>
                    </TableRow>
                  ) : (
                    groupCustomers.map((customer) => (
                      <TableRow 
                        key={customer.id} 
                        className="cursor-pointer hover:bg-muted/50 group"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <TableCell className="font-medium text-primary group-hover:underline">
                          {customer.company}
                        </TableCell>
                        <TableCell className="text-center">
                            <Badge variant="secondary" className="font-normal min-w-[2rem] justify-center">
                                {customer.totalBookings}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-success">
                            ₹{(customer.totalSpent / 100000).toFixed(2)}L
                        </TableCell>
                        <TableCell className="text-right font-bold text-success">
                            ₹{(customer.totalSpent / 100000).toFixed(2)}L
                        </TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}