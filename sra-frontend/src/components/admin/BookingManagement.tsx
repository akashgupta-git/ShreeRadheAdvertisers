import { useState } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Clock, FileText, Search, Eye, Pencil, Trash2, IndianRupee } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Booking, Customer } from "@/lib/data"; // Added Customer to import

// --- VIEW DETAILS DIALOG ---
interface ViewBookingDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewBookingDialog({ booking, open, onOpenChange }: ViewBookingDialogProps) {
  if (!booking) return null;

  const balance = booking.amount - booking.amountPaid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Booking Details
          </DialogTitle>
          <DialogDescription>Booking ID: <span className="font-mono text-xs text-foreground">{booking.id}</span></DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-2">
          {/* Status Banner */}
          <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border">
             <div className="flex flex-col">
               <span className="text-xs font-medium text-muted-foreground">Booking Status</span>
               <Badge variant={booking.status.toLowerCase() === 'active' ? 'success' : 'outline'} className="w-fit mt-1">
                 {booking.status}
               </Badge>
             </div>
             <div className="flex flex-col items-end">
               <span className="text-xs font-medium text-muted-foreground">Payment Status</span>
               <Badge variant={booking.paymentStatus === 'Paid' ? 'success' : 'warning'} className="w-fit mt-1">
                 {booking.paymentStatus}
               </Badge>
             </div>
          </div>

          <div className="grid gap-5">
            {/* Media Info */}
            <div className="flex gap-3">
              <div className="mt-1 bg-primary/10 p-2 rounded-md h-fit text-primary"><MapPin className="h-4 w-4" /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Media Location</p>
                <p className="font-semibold text-lg">{booking.media?.name}</p>
                <p className="text-sm text-muted-foreground">{booking.media?.city}, {booking.media?.district}</p>
                <Badge variant="secondary" className="mt-1 text-xs font-normal">{booking.media?.type}</Badge>
              </div>
            </div>

            <Separator />

            {/* Date Info */}
            <div className="flex gap-3">
              <div className="mt-1 bg-primary/10 p-2 rounded-md h-fit text-primary"><Calendar className="h-4 w-4" /></div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 w-full">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                  <p className="font-medium">{booking.startDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">End Date</p>
                  <p className="font-medium">{booking.endDate}</p>
                </div>
              </div>
            </div>

             <Separator />

            {/* Financial Info */}
            <div className="flex gap-3">
               <div className="mt-1 bg-primary/10 p-2 rounded-md h-fit text-primary"><IndianRupee className="h-4 w-4" /></div>
               <div className="w-full">
                 <p className="text-sm font-medium text-muted-foreground mb-1">Financials</p>
                 <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-md">
                   <div>
                     <span className="text-xs text-muted-foreground">Total Amount</span>
                     <p className="font-semibold">₹{booking.amount.toLocaleString()}</p>
                   </div>
                   <div>
                     <span className="text-xs text-muted-foreground">Paid Amount</span>
                     <p className="font-semibold text-success">₹{booking.amountPaid.toLocaleString()}</p>
                   </div>
                   <div className="col-span-2 border-t pt-2 mt-1 flex justify-between items-center">
                     <span className="text-sm font-medium">Balance Due</span>
                     <span className={balance > 0 ? "text-destructive font-bold" : "text-muted-foreground"}>
                       ₹{balance.toLocaleString()}
                     </span>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- EDIT BOOKING DIALOG ---
interface EditBookingDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedBooking: Booking) => void;
}

export function EditBookingDialog({ booking, open, onOpenChange, onSave }: EditBookingDialogProps) {
  const [formData, setFormData] = useState<Booking | null>(null);

  // Initialize form data when booking changes
  if (booking && (!formData || formData.id !== booking.id)) {
    setFormData(booking);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
      onOpenChange(false);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modify Booking</DialogTitle>
          <DialogDescription>Update schedule, status or pricing.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          
          <div className="space-y-2">
            <Label>Booking Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(val) => setFormData({...formData, status: val})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Upcoming">Upcoming</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input 
                type="date" 
                value={formData.startDate} 
                onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input 
                type="date" 
                value={formData.endDate} 
                onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Agreed Amount (₹)</Label>
            <Input 
              type="number" 
              value={formData.amount} 
              onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} 
            />
          </div>

          <div className="bg-muted p-3 rounded-md text-xs text-muted-foreground flex gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            Changing dates will not automatically recalculate the price. Please update the amount manually if needed.
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- DELETE CONFIRMATION ---
interface DeleteBookingDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => void;
}

export function DeleteBookingDialog({ booking, open, onOpenChange, onConfirm }: DeleteBookingDialogProps) {
  if (!booking) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Cancel Booking?</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel booking <span className="font-mono text-xs font-bold text-foreground">{booking.id}</span>?
          </DialogDescription>
        </DialogHeader>
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
          This action will remove the booking permanently from the customer's record.
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Keep Booking</Button>
          <Button variant="destructive" onClick={() => { onConfirm(booking.id); onOpenChange(false); }}>Yes, Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- ALL BOOKINGS MASTER LIST DIALOG ---
interface AllBookingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookings: Booking[];
  customers: Customer[]; // Changed from any[] to Customer[]
  onEdit: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
  onView: (booking: Booking) => void;
}

export function AllBookingsDialog({ 
  open, 
  onOpenChange, 
  bookings, 
  customers, 
  onEdit, 
  onDelete, 
  onView 
}: AllBookingsDialogProps) {
  const [search, setSearch] = useState("");

  const filteredBookings = bookings.filter(b => {
    const customer = customers.find(c => c.id === b.customerId);
    const searchLower = search.toLowerCase();
    return (
      b.id.toLowerCase().includes(searchLower) ||
      b.media?.name.toLowerCase().includes(searchLower) ||
      customer?.name.toLowerCase().includes(searchLower) ||
      customer?.company.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>All Bookings Master List</DialogTitle>
          <DialogDescription>
            View and manage {bookings.length} total bookings across all customers.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, Customer, or Media..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1 border rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Booking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Media</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => {
                  const customer = customers.find(c => c.id === booking.customerId);
                  return (
                    <TableRow key={booking.id} className="hover:bg-muted/20">
                      <TableCell className="font-mono text-xs font-medium">{booking.id}</TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{customer?.company || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">{customer?.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm truncate max-w-[180px]" title={booking.media?.name}>
                          {booking.media?.name}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {booking.media?.city}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1"><Calendar className="h-3 w-3 text-muted-foreground" /> {booking.startDate}</div>
                        <div className="ml-4 text-muted-foreground">to {booking.endDate}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge 
                            variant={
                              booking.status.toLowerCase() === 'active' ? 'success' : 
                              booking.status.toLowerCase() === 'completed' ? 'secondary' : 
                              'outline'
                            } 
                            className="capitalize text-xs font-normal w-fit"
                          >
                            {booking.status}
                          </Badge>
                          {/* Added Payment Status Badge here too */}
                          <span className={`text-[10px] px-1.5 rounded-sm w-fit ${
                            booking.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 
                            booking.paymentStatus === 'Pending' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{booking.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(booking)} title="View">
                            <Eye className="h-4 w-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(booking)} title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => onDelete(booking)} title="Delete">
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
  );
}