import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Users, Search, Building2, Mail, Phone, MapPin, Calendar, IndianRupee,
  ChevronDown, ChevronUp, ExternalLink, Plus, Pencil, Trash2, Settings, FolderCog, Eye, MoreHorizontal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { customers as initialCustomers, customerGroups as initialGroups, bookings as initialBookings, type Customer, type Booking } from "@/lib/data";
import { AddCustomerDialog, EditCustomerDialog, DeleteCustomerDialog } from "@/components/admin/CustomerManagement";
import { CreateBookingDialog } from "@/components/admin/CreateBookingDialog";
import { CustomerGroupInsights } from "@/components/admin/CustomerGroupInsights";
import { ManageGroupsDialog } from "@/components/admin/GroupManagement";
import { EditBookingDialog, ViewBookingDialog, DeleteBookingDialog, AllBookingsDialog } from "@/components/admin/BookingManagement";
import { toast } from "@/hooks/use-toast";

// Interface for CustomerCard
interface CustomerCardProps {
  customer: Customer;
  bookings: Booking[];
  onEditBooking: (b: Booking) => void;
  onDeleteBooking: (b: Booking) => void;
  onViewBooking: (b: Booking) => void;
}

function CustomerCard({ customer, bookings, onEditBooking, onDeleteBooking, onViewBooking }: CustomerCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const activeBookings = bookings.filter(b => b.status === 'Active' || b.status === 'active').length;
  const completedBookings = bookings.filter(b => b.status === 'Completed' || b.status === 'completed').length;
  const upcomingBookings = bookings.filter(b => b.status === 'Upcoming' || b.status === 'upcoming').length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg">{customer.company}</CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {customer.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-xl font-bold text-primary">{bookings.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-xl font-bold text-success flex items-center justify-end gap-0.5">
                    <IndianRupee className="h-4 w-4" /> 
                    {(bookings.reduce((sum, b) => sum + b.amount, 0) / 100000).toFixed(1)}L
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0">
                  {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /> <span>{customer.email}</span></div>
              <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /> <span>{customer.phone}</span></div>
              <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /> <span>{customer.address}</span></div>
              <div className="flex items-center gap-2 text-sm md:col-span-3 border-t pt-2 mt-2">
                 <span className="text-muted-foreground">Group:</span>
                 <Badge variant="outline">{customer.group || 'General'}</Badge>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Badge variant="success" className="px-3 py-1">{activeBookings} Active</Badge>
              <Badge variant="secondary" className="px-3 py-1">{completedBookings} Completed</Badge>
              <Badge variant="outline" className="px-3 py-1">{upcomingBookings} Upcoming</Badge>
            </div>

            <div className="border border-border/50 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Media</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id} className="hover:bg-muted/30 group">
                      <TableCell className="font-mono text-xs">{booking.id}</TableCell>
                      <TableCell>
                        <div><p className="font-medium">{booking.media?.name || booking.mediaId}</p><p className="text-xs text-muted-foreground">{booking.media?.city}</p></div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{booking.media?.type}</Badge></TableCell>
                      <TableCell><div className="text-sm"><p>{booking.startDate}</p><p className="text-xs text-muted-foreground">{booking.endDate}</p></div></TableCell>
                      <TableCell><span className="flex items-center font-semibold"><IndianRupee className="h-3 w-3" />{booking.amount.toLocaleString()}</span></TableCell>
                      <TableCell>
                        <Badge 
                           className="capitalize"
                           variant={
                            booking.status.toLowerCase() === 'active' ? 'success' : 
                            booking.status.toLowerCase() === 'completed' ? 'secondary' : 
                            'outline'
                          }>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* View Button */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary" 
                            onClick={(e) => { e.stopPropagation(); onViewBooking(booking); }}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Action Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => onEditBooking(booking)}>
                                <Pencil className="h-4 w-4 mr-2" /> Modify Booking
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/admin/media/${booking.mediaId}`}>
                                  <ExternalLink className="h-4 w-4 mr-2" /> View Media Asset
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive" 
                                onClick={() => onDeleteBooking(booking)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Cancel / Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {bookings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No bookings found for this customer.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export default function CustomerBookings() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for Data
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [groups, setGroups] = useState<string[]>(initialGroups);
  // Replaced any[] with Booking[]
  const [allBookings, setAllBookings] = useState<Booking[]>(initialBookings); 

  const [activeTab, setActiveTab] = useState("bookings");
  
  // Dialog States - Customer & Group
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [manageGroupsOpen, setManageGroupsOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);

  // Dialog States - Bookings (Replaced any | null with Booking | null)
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [deleteBooking, setDeleteBooking] = useState<Booking | null>(null);
  const [allBookingsDialogOpen, setAllBookingsDialogOpen] = useState(false);

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.group && customer.group.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalCustomers = customers.length;
  const totalBookingsCount = allBookings.length;
  const totalRevenue = allBookings.reduce((sum, b) => sum + b.amount, 0);

  // --- Handlers ---
  
  const handleCustomerAdded = (newCustomer: Customer) => setCustomers(prev => [...prev, newCustomer]);
  const handleCustomerUpdated = (updatedCustomer: Customer) => setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  const handleCustomerDeleted = (customerId: string) => setCustomers(prev => prev.filter(c => c.id !== customerId));
  const handleAddGroup = (newGroup: string) => { if (!groups.includes(newGroup)) setGroups([...groups, newGroup]); };

  // Booking Handlers (Using Booking type)
  const handleUpdateBooking = (updatedBooking: Booking) => {
    setAllBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
    toast({ title: "Booking Updated", description: "Changes saved successfully." });
  };

  const handleDeleteBooking = (id: string) => {
    setAllBookings(prev => prev.filter(b => b.id !== id));
    toast({ title: "Booking Deleted", description: "Booking has been removed permanently." });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Customer Bookings</h1>
          <p className="text-muted-foreground mt-1">View and manage customer-wise booking history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setManageGroupsOpen(true)}>
            <FolderCog className="h-4 w-4 mr-2" />
            Manage Groups
          </Button>
          <Button variant="outline" onClick={() => setAddCustomerOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
          <CreateBookingDialog />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="bookings">Customer Bookings</TabsTrigger>
          <TabsTrigger value="manage">Manage Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-6 mt-6">
          {/* INTERACTIVE STATS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Total Customers - Click to switch to Manage Tab */}
            <Card 
              className="bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => setActiveTab("manage")}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Users className="h-6 w-6"/>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">Total Customers</p>
                  <p className="text-2xl font-bold">{totalCustomers}</p>
                </div>
              </CardContent>
            </Card>

            {/* Total Bookings - Click to open All Bookings Master Dialog */}
            <Card 
              className="bg-card/50 backdrop-blur-sm hover:border-accent/50 transition-all cursor-pointer group"
              onClick={() => setAllBookingsDialogOpen(true)}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="rounded-xl bg-accent/10 p-3 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                  <Calendar className="h-6 w-6"/>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground group-hover:text-accent transition-colors">Total Bookings</p>
                  <p className="text-2xl font-bold">{totalBookingsCount}</p>
                </div>
              </CardContent>
            </Card>

            {/* Total Revenue - (Static for now) */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="rounded-xl bg-success/10 p-3 text-success">
                  <IndianRupee className="h-6 w-6"/>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{(totalRevenue / 10000000).toFixed(2)} Cr</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="my-8"><CustomerGroupInsights customers={customers} /></div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search customers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-background/50" />
          </div>

          <div className="space-y-4">
            {filteredCustomers.map((customer) => (
              <CustomerCard 
                key={customer.id} 
                customer={customer} 
                bookings={allBookings.filter(b => b.customerId === customer.id)} 
                onEditBooking={setEditBooking}
                onDeleteBooking={setDeleteBooking}
                onViewBooking={setViewBooking}
              />
            ))}
            {filteredCustomers.length === 0 && <Card><CardContent className="p-12 text-center text-muted-foreground">No customers found</CardContent></Card>}
          </div>
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          <Card className="bg-card/50">
            <CardHeader><div className="flex justify-between"><CardTitle className="flex gap-2"><Settings className="h-5 w-5"/> Manage Customers</CardTitle><Button onClick={() => setAddCustomerOpen(true)}><Plus className="h-4 w-4 mr-2"/> Add Customer</Button></div></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Company</TableHead><TableHead>Contact</TableHead><TableHead>Group</TableHead><TableHead>Bookings</TableHead><TableHead>Spent</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {customers.map(c => {
                    const custBookings = allBookings.filter(b => b.customerId === c.id);
                    const spent = custBookings.reduce((sum, b) => sum + b.amount, 0);
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs">{c.id}</TableCell>
                        <TableCell className="font-medium">{c.company}</TableCell>
                        <TableCell>{c.name}</TableCell>
                        <TableCell><Badge variant="outline" className="font-normal">{c.group || 'N/A'}</Badge></TableCell>
                        <TableCell><Badge variant="secondary">{custBookings.length}</Badge></TableCell>
                        <TableCell className="font-medium">₹{(spent/100000).toFixed(1)}L</TableCell>
                        <TableCell className="text-right flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setEditCustomer(c)}><Pencil className="h-4 w-4"/></Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteCustomer(c)}><Trash2 className="h-4 w-4"/></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- DIALOGS --- */}
      
      <ManageGroupsDialog 
        open={manageGroupsOpen} 
        onOpenChange={setManageGroupsOpen}
        groups={groups}
        customers={customers}
        onUpdateGroups={setGroups}
        onUpdateCustomers={setCustomers}
      />

      <AddCustomerDialog 
        open={addCustomerOpen} 
        onOpenChange={setAddCustomerOpen} 
        onCustomerAdded={handleCustomerAdded}
        availableGroups={groups}
        onAddGroup={handleAddGroup}
      />
      
      {editCustomer && (
        <EditCustomerDialog 
          customer={editCustomer} 
          open={!!editCustomer} 
          onOpenChange={(open) => !open && setEditCustomer(null)} 
          onCustomerUpdated={handleCustomerUpdated}
          availableGroups={groups}
          onAddGroup={handleAddGroup}
        />
      )}
      
      {deleteCustomer && (
        <DeleteCustomerDialog 
          customer={deleteCustomer} 
          open={!!deleteCustomer} 
          onOpenChange={(open) => !open && setDeleteCustomer(null)} 
          onCustomerDeleted={handleCustomerDeleted} 
        />
      )}

      {/* --- BOOKING MANAGEMENT DIALOGS --- */}
      {viewBooking && (
        <ViewBookingDialog 
           booking={viewBooking} 
           open={!!viewBooking} 
           onOpenChange={(open) => !open && setViewBooking(null)}
        />
      )}

      {editBooking && (
        <EditBookingDialog 
           booking={editBooking} 
           open={!!editBooking} 
           onOpenChange={(open) => !open && setEditBooking(null)}
           onSave={handleUpdateBooking}
        />
      )}

      {deleteBooking && (
        <DeleteBookingDialog 
           booking={deleteBooking} 
           open={!!deleteBooking} 
           onOpenChange={(open) => !open && setDeleteBooking(null)}
           onConfirm={handleDeleteBooking}
        />
      )}

      {/* ALL BOOKINGS MASTER DIALOG */}
      <AllBookingsDialog 
        open={allBookingsDialogOpen}
        onOpenChange={setAllBookingsDialogOpen}
        bookings={allBookings}
        customers={customers}
        onEdit={setEditBooking}
        onDelete={setDeleteBooking}
        onView={setViewBooking}
      />
    </div>
  );
}