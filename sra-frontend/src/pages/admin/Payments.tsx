import { useState } from "react";
import { EditPaymentDialog, NewPaymentDialog } from "@/components/admin/PaymentManagement";
import { bookings as initialBookings, Booking, customers, PaymentStatus, PaymentMode, customerGroups } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Download, 
  ChevronRight,
  Wallet,
  Banknote,
  Landmark,
  ScrollText,
  Plus,
  Filter,
  X
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Payments = () => {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'All'>('All');
  const [modeFilter, setModeFilter] = useState<PaymentMode | 'All'>('All');
  const [groupFilter, setGroupFilter] = useState<string>('All');
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [search, setSearch] = useState("");
  
  // Dialog States
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);

  // Helper to clear advanced filters
  const clearFilters = () => {
    setGroupFilter('All');
    setDateRange({ start: "", end: "" });
  };

  const filteredBookings = bookings.filter(b => {
    const customer = customers.find(c => c.id === b.customerId);
    
    // 1. Basic Filters
    const matchesStatus = statusFilter === 'All' ? true : b.paymentStatus === statusFilter;
    const matchesMode = modeFilter === 'All' ? true : b.paymentMode === modeFilter;
    
    // 2. Search
    const matchesSearch =
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.media?.name.toLowerCase().includes(search.toLowerCase()) ||
      customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      customer?.company.toLowerCase().includes(search.toLowerCase());

    // 3. Advanced Filters
    const matchesGroup = groupFilter === 'All' ? true : customer?.group === groupFilter;
    
    const matchesDate = (() => {
      if (!dateRange.start && !dateRange.end) return true;
      const bookingDate = new Date(b.startDate);
      const start = dateRange.start ? new Date(dateRange.start) : null;
      const end = dateRange.end ? new Date(dateRange.end) : null;
      
      if (start && bookingDate < start) return false;
      if (end && bookingDate > end) return false;
      return true;
    })();
      
    return matchesStatus && matchesMode && matchesSearch && matchesGroup && matchesDate;
  });

  const handlePaymentUpdate = (id: string, newAmountPaid: number, status: PaymentStatus, mode: PaymentMode) => {
    setBookings(prev => prev.map(b => {
      if (b.id === id) {
        return { ...b, amountPaid: newAmountPaid, paymentStatus: status, paymentMode: mode };
      }
      return b;
    }));
  };

  const handleRowClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsEditOpen(true);
  };

  const getModeIcon = (mode?: PaymentMode) => {
    switch (mode) {
      case 'Online': return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'Cash': return <Banknote className="h-4 w-4 text-green-600" />;
      case 'Cheque': return <ScrollText className="h-4 w-4 text-orange-500" />;
      case 'Bank Transfer': return <Landmark className="h-4 w-4 text-purple-500" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const hasActiveFilters = groupFilter !== 'All' || dateRange.start || dateRange.end;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            Payments & Invoices
          </h1>
          <p className="text-muted-foreground">Manage billing, track payments, and edit transaction details.</p>
        </div>
        <div className="flex gap-2">
           <Button onClick={() => setIsNewPaymentOpen(true)}>
             <Plus className="mr-2 h-4 w-4" /> Record Payment
           </Button>
           <Button variant="outline">
             <Download className="mr-2 h-4 w-4" /> Export Report
           </Button>
        </div>
      </div>

      <Card className="p-6 border-border/50 bg-card">
        {/* Toolbar */}
        <div className="flex flex-col xl:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto items-start sm:items-center">
             {/* Search */}
             <div className="relative w-full sm:w-64">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input
                 placeholder="Search ID, Client..."
                 className="pl-9"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
             </div>
             
             {/* Mode Filter */}
             <Select value={modeFilter} onValueChange={(val) => setModeFilter(val as PaymentMode | 'All')}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Modes</SelectItem>
                  <SelectItem value="Online">Online / UPI</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
             </Select>

             {/* Advanced Filters Sheet */}
             <Sheet>
               <SheetTrigger asChild>
                 <Button variant={hasActiveFilters ? "secondary" : "outline"} size="icon" title="More Filters">
                   <Filter className="h-4 w-4" />
                 </Button>
               </SheetTrigger>
               <SheetContent side="right">
                 <SheetHeader>
                   <SheetTitle>Advanced Filters</SheetTitle>
                   <SheetDescription>Narrow down transactions by date or client group.</SheetDescription>
                 </SheetHeader>
                 <div className="space-y-6 py-6">
                   <div className="space-y-2">
                     <Label>Client Group</Label>
                     <Select value={groupFilter} onValueChange={setGroupFilter}>
                       <SelectTrigger>
                         <SelectValue placeholder="Select Group" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="All">All Groups</SelectItem>
                         {customerGroups.map(g => (
                           <SelectItem key={g} value={g}>{g}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                   
                   <div className="space-y-2">
                     <Label>Start Date (From)</Label>
                     <Input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
                   </div>

                   <div className="space-y-2">
                     <Label>Start Date (To)</Label>
                     <Input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
                   </div>

                   {hasActiveFilters && (
                     <Button variant="ghost" onClick={clearFilters} className="w-full text-muted-foreground hover:text-destructive">
                       <X className="mr-2 h-4 w-4" /> Clear Filters
                     </Button>
                   )}
                 </div>
               </SheetContent>
             </Sheet>
          </div>
          
          {/* Status Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 xl:pb-0">
             {(['All', 'Pending', 'Partially Paid', 'Paid'] as const).map(f => (
               <Button
                  key={f}
                  variant={statusFilter === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(f)}
                  className="whitespace-nowrap"
               >
                 {f}
               </Button>
             ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Booking ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Contract Value</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Payment Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No payments found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => {
                  const customer = customers.find(c => c.id === booking.customerId);
                  const progress = Math.min(100, (booking.amountPaid / booking.amount) * 100);
                  const isFullyPaid = booking.paymentStatus === 'Paid';

                  return (
                    <TableRow 
                      key={booking.id} 
                      className="hover:bg-muted/50 cursor-pointer group transition-colors"
                      onClick={() => handleRowClick(booking)}
                    >
                      <TableCell className="font-mono font-medium">
                        <div className="flex items-center gap-2">
                           {booking.id}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{booking.startDate}</div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-medium">{customer?.company}</div>
                        <Badge variant="outline" className="text-[10px] font-normal mt-0.5">{customer?.group}</Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-medium">₹{booking.amount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          Due: <span className={booking.amount - booking.amountPaid > 0 ? "text-destructive" : "text-success"}>
                            ₹{(booking.amount - booking.amountPaid).toLocaleString()}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                         {booking.amountPaid > 0 ? (
                            <div className="flex items-center gap-2 border rounded-md px-2 py-1 w-fit bg-muted/30">
                              {getModeIcon(booking.paymentMode)}
                              <span className="text-sm">{booking.paymentMode}</span>
                            </div>
                         ) : (
                            <span className="text-xs text-muted-foreground italic pl-2">Pending</span>
                         )}
                      </TableCell>
                      
                      <TableCell className="w-[15%]">
                         <div className="flex items-center gap-2 mb-1">
                           <span className="text-xs font-medium">{Math.round(progress)}%</span>
                           <span className="text-xs text-muted-foreground ml-auto">₹{booking.amountPaid.toLocaleString()}</span>
                         </div>
                         <Progress value={progress} className="h-2" />
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={
                          booking.paymentStatus === 'Paid' ? 'success' : 
                          booking.paymentStatus === 'Partially Paid' ? 'warning' : 'destructive'
                        }>
                           {booking.paymentStatus === 'Paid' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                           {booking.paymentStatus === 'Pending' && <AlertCircle className="mr-1 h-3 w-3" />}
                           {booking.paymentStatus === 'Partially Paid' && <Clock className="mr-1 h-3 w-3" />}
                           {booking.paymentStatus}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-muted-foreground group-hover:text-foreground"
                        >
                           Edit <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <EditPaymentDialog 
        booking={selectedBooking}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSave={handlePaymentUpdate}
      />

      <NewPaymentDialog 
        bookings={bookings}
        open={isNewPaymentOpen}
        onOpenChange={setIsNewPaymentOpen}
        onPaymentRecorded={handlePaymentUpdate}
      />
    </div>
  );
};

export default Payments;