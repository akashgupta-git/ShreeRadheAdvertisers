import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Booking, PaymentMode, PaymentStatus, customers } from "@/lib/data";
import { IndianRupee, CreditCard, Pencil, Calculator, ChevronsUpDown, Check, Trash2, Search, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { cn, formatIndianRupee } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// --- 1. RECORD PAYMENT DIALOG (Incremental) ---
interface RecordPaymentDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentRecorded: (bookingId: string, newAmountPaid: number, status: PaymentStatus, mode: PaymentMode) => void;
}

export function RecordPaymentDialog({ booking, open, onOpenChange, onPaymentRecorded }: RecordPaymentDialogProps) {
  const [amountToPay, setAmountToPay] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("Online");
  
  const currentPaid = booking?.amountPaid || 0;
  const totalAmount = booking?.amount || 0;
  const balance = totalAmount - currentPaid;
  const newTotalPaid = currentPaid + (Number(amountToPay) || 0);
  const remainingAfterPayment = totalAmount - newTotalPaid;

  useEffect(() => {
    if (open) {
      setAmountToPay("");
      setPaymentMode("Online");
    }
  }, [open, booking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    const payAmount = Number(amountToPay);
    if (payAmount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    if (payAmount > balance) {
      toast.error("Payment amount cannot exceed the outstanding balance.");
      return;
    }

    let newStatus: PaymentStatus = 'Pending';
    if (remainingAfterPayment <= 0) {
      newStatus = 'Paid';
    } else {
      newStatus = 'Partially Paid';
    }

    onPaymentRecorded(booking.id, newTotalPaid, newStatus, paymentMode);
    toast.success(`Payment of ₹${formatIndianRupee(payAmount)} recorded successfully.`);
    onOpenChange(false);
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>Add a new transaction for Booking {booking.id}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted/40 p-4 rounded-lg space-y-3 border">
             <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Contract Value:</span>
                <span className="font-medium">₹{formatIndianRupee(totalAmount)}</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Already Paid:</span>
                <span className="font-medium text-success">₹{formatIndianRupee(currentPaid)}</span>
             </div>
             <div className="h-px bg-border my-2" />
             <div className="flex justify-between font-semibold">
                <span>Outstanding Balance:</span>
                <span className="text-destructive">₹{formatIndianRupee(balance)}</span>
             </div>
          </div>

          <div className="space-y-2">
            <Label>Payment Amount (₹)</Label>
            <div className="relative">
              <IndianRupee className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="number" 
                className="pl-9" 
                placeholder="0.00"
                value={amountToPay}
                onChange={(e) => setAmountToPay(e.target.value)}
                max={balance}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              New Balance will be: <span className={remainingAfterPayment === 0 ? "text-success font-bold" : "text-foreground"}>₹{formatIndianRupee(Math.max(0, remainingAfterPayment))}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMode} onValueChange={(val) => setPaymentMode(val as PaymentMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Online">Online / UPI</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer (NEFT/RTGS)</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!amountToPay || Number(amountToPay) <= 0}>Confirm Payment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- 2. NEW PAYMENT DIALOG (Select Booking -> Record) ---
interface NewPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookings: Booking[];
  onPaymentRecorded: (bookingId: string, newAmountPaid: number, status: PaymentStatus, mode: PaymentMode) => void;
}

export function NewPaymentDialog({ open, onOpenChange, bookings, onPaymentRecorded }: NewPaymentDialogProps) {
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [amountToPay, setAmountToPay] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("Online");

  const selectedBooking = bookings.find(b => b.id === selectedBookingId);

  useEffect(() => {
    if (!open) {
      setSelectedBookingId("");
      setAmountToPay("");
      setPaymentMode("Online");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    const payAmount = Number(amountToPay);
    const balance = selectedBooking.amount - selectedBooking.amountPaid;

    if (payAmount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    if (payAmount > balance) {
      toast.error("Payment amount cannot exceed the outstanding balance.");
      return;
    }

    const newTotalPaid = selectedBooking.amountPaid + payAmount;
    const remaining = selectedBooking.amount - newTotalPaid;
    
    let newStatus: PaymentStatus = 'Pending';
    if (remaining <= 0) newStatus = 'Paid';
    else newStatus = 'Partially Paid';

    onPaymentRecorded(selectedBooking.id, newTotalPaid, newStatus, paymentMode);
    toast.success("Payment recorded successfully.");
    onOpenChange(false);
  };

  const currentBalance = selectedBooking ? selectedBooking.amount - selectedBooking.amountPaid : 0;
  const remainingAfter = selectedBooking ? currentBalance - (Number(amountToPay) || 0) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-visible">
        <DialogHeader>
          <DialogTitle>Record New Payment</DialogTitle>
          <DialogDescription>Select a booking and record a payment.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2 flex flex-col">
            <Label>Select Booking</Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className={cn(
                    "w-full justify-between font-normal",
                    !selectedBookingId && "text-muted-foreground"
                  )}
                >
                  {selectedBookingId
                    ? bookings.find((b) => b.id === selectedBookingId)?.id + " - " + customers.find(c => c.id === bookings.find(b => b.id === selectedBookingId)?.customerId)?.company
                    : "Search booking by ID or Client..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search booking..." />
                  <CommandList>
                    <CommandEmpty>No booking found.</CommandEmpty>
                    <CommandGroup>
                      {bookings.map((booking) => {
                         const client = customers.find(c => c.id === booking.customerId);
                         return (
                           <CommandItem
                             key={booking.id}
                             value={`${booking.id} ${client?.company || ''}`}
                             onSelect={() => {
                               setSelectedBookingId(booking.id);
                               setOpenCombobox(false);
                             }}
                           >
                             <Check
                               className={cn(
                                 "mr-2 h-4 w-4",
                                 selectedBookingId === booking.id ? "opacity-100" : "opacity-0"
                               )}
                             />
                             <div className="flex flex-col">
                               <span className="font-medium">{booking.id}</span>
                                <span className="text-xs text-muted-foreground">
                                  {client?.company} • ₹{formatIndianRupee(booking.amount)}
                                </span>
                             </div>
                           </CommandItem>
                         );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedBooking && (
            <>
              <div className="bg-muted/40 p-3 rounded-md text-sm space-y-2 border">
                 <div className="flex justify-between">
                   <span className="text-muted-foreground">Booking:</span>
                   <span className="font-medium">{selectedBooking.media?.name}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-muted-foreground">Outstanding Balance:</span>
                   <span className={cn("font-bold", currentBalance > 0 ? "text-destructive" : "text-success")}>
                     ₹{formatIndianRupee(currentBalance)}
                   </span>
                 </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Amount (₹)</Label>
                <Input 
                  type="number" 
                  placeholder="0.00"
                  value={amountToPay}
                  onChange={(e) => setAmountToPay(e.target.value)}
                  max={currentBalance}
                  disabled={currentBalance <= 0}
                />
                <p className="text-xs text-muted-foreground">
                  Balance after payment: <span className="font-medium">₹{formatIndianRupee(Math.max(0, remainingAfter))}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMode} onValueChange={(val) => setPaymentMode(val as PaymentMode)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">Online / UPI</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <DialogFooter className="mt-4">
             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
             <Button type="submit" disabled={!selectedBooking || !amountToPay || Number(amountToPay) <= 0}>
               Record Payment
             </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- 3. EDIT PAYMENT DETAILS DIALOG (Absolute Edit) ---
interface EditPaymentDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (bookingId: string, newAmountPaid: number, status: PaymentStatus, mode: PaymentMode) => void;
}

export function EditPaymentDialog({ booking, open, onOpenChange, onSave }: EditPaymentDialogProps) {
  const [formData, setFormData] = useState({
    amountPaid: 0,
    status: 'Pending' as PaymentStatus,
    mode: 'Online' as PaymentMode
  });

  useEffect(() => {
    if (booking && open) {
      setFormData({
        amountPaid: booking.amountPaid,
        status: booking.paymentStatus,
        mode: booking.paymentMode || 'Online'
      });
    }
  }, [booking, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    if (formData.amountPaid < 0 || formData.amountPaid > booking.amount) {
      toast.error("Invalid paid amount. It cannot be negative or exceed the contract value.");
      return;
    }

    onSave(booking.id, formData.amountPaid, formData.status, formData.mode);
    toast.success("Payment details updated successfully.");
    onOpenChange(false);
  };

  const autoCalculateStatus = () => {
     if (!booking) return;
     if (formData.amountPaid >= booking.amount) {
       setFormData(prev => ({ ...prev, status: 'Paid' }));
     } else if (formData.amountPaid > 0) {
       setFormData(prev => ({ ...prev, status: 'Partially Paid' }));
     } else {
       setFormData(prev => ({ ...prev, status: 'Pending' }));
     }
     toast.info("Status auto-calculated based on amount.");
  };

  if (!booking) return null;

  const balance = booking.amount - formData.amountPaid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Edit Payment Details
          </DialogTitle>
          <DialogDescription>
            Modify payment records for Booking <span className="font-mono text-xs">{booking.id}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <Label className="text-xs text-muted-foreground">Contract Value</Label>
               <div className="text-lg font-semibold">₹{formatIndianRupee(booking.amount)}</div>
             </div>
             <div className="space-y-1 text-right">
               <Label className="text-xs text-muted-foreground">Current Balance</Label>
               <div className={balance > 0 ? "text-lg font-semibold text-destructive" : "text-lg font-semibold text-success"}>
                 ₹{formatIndianRupee(balance)}
               </div>
             </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Total Amount Paid (₹)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <IndianRupee className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="number" 
                    className="pl-9" 
                    value={formData.amountPaid}
                    onChange={(e) => setFormData({ ...formData, amountPaid: Number(e.target.value) })}
                  />
                </div>
                <Button type="button" variant="outline" size="icon" title="Auto-calc Status" onClick={autoCalculateStatus}>
                  <Calculator className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(val) => setFormData({ ...formData, status: val as PaymentStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <Select 
                  value={formData.mode} 
                  onValueChange={(val) => setFormData({ ...formData, mode: val as PaymentMode })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">Online / UPI</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- 4. PAYMENTS LIST DIALOG (Detailed View) ---
interface PaymentListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookings: Booking[];
  initialFilter?: PaymentStatus | 'All';
  onUpdateBooking: (updatedBooking: Booking) => void;
  onDeleteBooking: (id: string) => void; // Added for administrative deletion
}

export function PaymentListDialog({ open, onOpenChange, bookings, initialFilter = 'All', onUpdateBooking, onDeleteBooking }: PaymentListDialogProps) {
  const [filter, setFilter] = useState<PaymentStatus | 'All'>(initialFilter);
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (open) setFilter(initialFilter);
  }, [open, initialFilter]);

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = filter === 'All' ? true : b.paymentStatus === filter;
    const customer = customers.find(c => c.id === b.customerId);
    const matchesSearch = 
      b.id.toLowerCase().includes(search.toLowerCase()) || 
      b.media?.name.toLowerCase().includes(search.toLowerCase()) ||
      customer?.company.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleUpdate = (id: string, newAmountPaid: number, status: PaymentStatus, mode: PaymentMode) => {
     const booking = bookings.find(b => b.id === id);
     if (booking) {
       onUpdateBooking({ ...booking, amountPaid: newAmountPaid, paymentStatus: status, paymentMode: mode });
     }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Management Overview
            </DialogTitle>
            <DialogDescription>
              Detailed view of all transactions. You can record new payments, edit historical records, or remove invalid entries.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col sm:flex-row gap-4 py-4 justify-between items-end sm:items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Booking ID or Customer..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
               {(['All', 'Pending', 'Partially Paid', 'Paid'] as const).map(f => (
                 <Button
                    key={f}
                    variant={filter === f ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(f)}
                    className="whitespace-nowrap"
                 >
                   {f}
                 </Button>
               ))}
            </div>
          </div>

          <ScrollArea className="flex-1 border rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Booking Info</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Paid / Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Admin Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No matching records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => {
                    const customer = customers.find(c => c.id === booking.customerId);
                    void (booking.amountPaid / booking.amount); // progress calc reference
                    const isFullyPaid = booking.paymentStatus === 'Paid';

                    return (
                      <TableRow key={booking.id} className="group hover:bg-muted/30">
                        <TableCell>
                          <div className="font-mono text-xs font-bold text-primary">{booking.id}</div>
                          <div className="text-sm font-medium">{customer?.company}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[150px]">{booking.media?.name}</div>
                        </TableCell>
                        <TableCell className="font-medium">₹{booking.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex flex-col text-xs">
                             <span className="text-success font-medium">Paid: ₹{booking.amountPaid.toLocaleString()}</span>
                             {!isFullyPaid && (
                               <span className="text-destructive font-medium">Bal: ₹{(booking.amount - booking.amountPaid).toLocaleString()}</span>
                             )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={booking.paymentStatus === 'Paid' ? 'success' : booking.paymentStatus === 'Partially Paid' ? 'warning' : 'destructive'}>
                             {booking.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8"
                              disabled={isFullyPaid}
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsRecordOpen(true);
                              }}
                            >
                              Record Pay
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-primary"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsEditOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-destructive"
                              onClick={() => setDeleteConfirm(booking.id)}
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
          </ScrollArea>
          
          <DialogFooter className="mt-2">
             <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Payment Record?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the payment record for booking #{deleteConfirm?.slice(-6)}. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deleteConfirm) {
                  onDeleteBooking(deleteConfirm);
                  setDeleteConfirm(null);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RecordPaymentDialog 
        booking={selectedBooking}
        open={isRecordOpen}
        onOpenChange={setIsRecordOpen}
        onPaymentRecorded={handleUpdate}
      />

      <EditPaymentDialog 
        booking={selectedBooking}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSave={handleUpdate}
      />
    </>
  );
}