import { useState } from "react";
import { EditPaymentDialog, NewPaymentDialog, PaymentListDialog } from "@/components/admin/PaymentManagement";
import { bookings as initialBookings, Booking, customers, PaymentStatus, PaymentMode, customerGroups } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  X,
  IndianRupee,
  ArrowUpRight,
  Trash2,
  Pencil
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const [detailView, setDetailView] = useState<{ open: boolean; filter: PaymentStatus | 'All' }>({ 
    open: false, 
    filter: 'All' 
  });

  // Calculate Stats for Cards
  // const totalRevenue = bookings.reduce((acc, b) => acc + b.amountPaid, 0);
  // const pendingDues = bookings.reduce((acc, b) => acc + (b.amount - b.amountPaid), 0);
  const totalRevenue = bookings.reduce((acc, b) => acc + b.amountPaid, 0).toLocaleString('en-IN');
  const pendingDues = bookings.reduce((acc, b) => acc + (b.amount - b.amountPaid), 0).toLocaleString('en-IN');
  const partialCount = bookings.filter(b => b.paymentStatus === 'Partially Paid').length;
  const overdueCount = bookings.filter(b => b.paymentStatus === 'Pending').length;

  const summaryCards = [
    { 
      title: "Total Revenue Collected", 
      value: `₹${totalRevenue.toLocaleString()}`, 
      icon: IndianRupee, 
      color: "text-blue-600", 
      bg: "bg-blue-50",
      filter: 'Paid' as const,
      description: "Total payments received"
    },
    { 
      title: "Outstanding Dues", 
      value: `₹${pendingDues.toLocaleString()}`, 
      icon: AlertCircle, 
      color: "text-destructive", 
      bg: "bg-red-50",
      filter: 'Pending' as const,
      description: "Payments yet to be collected"
    },
    { 
      title: "Partial Payments", 
      value: partialCount, 
      icon: Clock, 
      color: "text-warning", 
      bg: "bg-orange-50",
      filter: 'Partially Paid' as const,
      description: "Active installment plans"
    },
    { 
      title: "Pending Bookings", 
      value: overdueCount, 
      icon: Banknote, 
      color: "text-purple-600", 
      bg: "bg-purple-50",
      filter: 'Pending' as const,
      description: "Zero payment recorded"
    },
  ];

  const clearFilters = () => {
    setGroupFilter('All');
    setDateRange({ start: "", end: "" });
  };

  const filteredBookings = bookings.filter(b => {
    const customer = customers.find(c => c.id === b.customerId);
    const matchesStatus = statusFilter === 'All' ? true : b.paymentStatus === statusFilter;
    const matchesMode = modeFilter === 'All' ? true : b.paymentMode === modeFilter;
    const matchesSearch =
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.media?.name.toLowerCase().includes(search.toLowerCase()) ||
      customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      customer?.company.toLowerCase().includes(search.toLowerCase());
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

  const handleDeletePayment = (id: string) => {
    // In a real app, this would be a soft delete API call
    setBookings(prev => prev.filter(b => b.id !== id));
    toast.success("Payment record moved to Recycle Bin");
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card 
            key={card.title} 
            className="hover:shadow-md transition-all cursor-pointer group border-border/50"
            onClick={() => setDetailView({ open: true, filter: card.filter })}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <div className={cn("p-2 rounded-lg", card.bg)}>
                <card.icon className={cn("h-4 w-4", card.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center mt-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                {card.description} <ArrowUpRight className="ml-1 h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="p-6 border-border/50 bg-card">
        {/* Toolbar */}
        <div className="flex flex-col xl:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto items-start sm:items-center">
             <div className="relative w-full sm:w-64">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input
                 placeholder="Search ID, Client..."
                 className="pl-9"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
             </div>
             
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
                <TableHead>Payment Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No payments found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => {
                  const customer = customers.find(c => c.id === booking.customerId);
                  const progress = Math.min(100, (booking.amountPaid / booking.amount) * 100);

                  return (
                    <TableRow key={booking.id} className="group transition-colors">
                      <TableCell className="font-mono font-medium">
                        <div>{booking.id}</div>
                        <div className="text-xs text-muted-foreground">{booking.startDate}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{customer?.company}</div>
                        <Badge variant="outline" className="text-[10px]">{customer?.group}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">₹{booking.amount.toLocaleString('en-IN')}</div>
                        <div className="text-xs text-muted-foreground">
                          Due: <span className={booking.amount - booking.amountPaid > 0 ? "text-destructive" : "text-success"}>
                            ₹{(booking.amount - booking.amountPaid).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="w-[15%]">
                         <div className="flex items-center gap-2 mb-1">
                           <span className="text-xs font-medium">{Math.round(progress)}%</span>
                         </div>
                         <Progress value={progress} className="h-2" />
                      </TableCell>
                      <TableCell>
                        <Badge variant={booking.paymentStatus === 'Paid' ? 'success' : booking.paymentStatus === 'Partially Paid' ? 'warning' : 'destructive'}>
                           {booking.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => { setSelectedBooking(booking); setIsEditOpen(true); }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeletePayment(booking.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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

      <PaymentListDialog 
        open={detailView.open}
        onOpenChange={(open) => setDetailView(prev => ({ ...prev, open }))}
        initialFilter={detailView.filter}
        bookings={bookings}
        onUpdateBooking={(updated) => handlePaymentUpdate(updated.id, updated.amountPaid, updated.paymentStatus, updated.paymentMode!)}
        onDeleteBooking={handleDeletePayment}
      />
    </div>
  );
};

export default Payments;