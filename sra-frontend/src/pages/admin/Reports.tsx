import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mediaLocations, bookings, states, districts, mediaTypes, customers, customerGroups } from "@/lib/data";
import { FileDown, Printer, Filter, Building2, Check, ChevronsUpDown, Briefcase, IndianRupee } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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

export default function Reports() {
  const [activeTab, setActiveTab] = useState("inventory");
  
  // General Filters
  const [stateFilter, setStateFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  // NEW: Payment Status Filter
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

  // Combobox Open States
  const [customerOpen, setCustomerOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);
  
  // Customer Specific Filters
  const [customerFilter, setCustomerFilter] = useState("all");

  // Group Specific Filters
  const [groupFilter, setGroupFilter] = useState("all");
  
  // Date Filters
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const availableDistricts = stateFilter !== "all" ? districts[stateFilter] || [] : [];

  // 1. Inventory Report Data (No Payment filter relevant here)
  const getInventoryData = () => {
    return mediaLocations.filter(item => {
      if (stateFilter !== "all" && item.state !== stateFilter) return false;
      if (districtFilter !== "all" && item.district !== districtFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      return true;
    });
  };

  // 2. Bookings Report Data
  const getBookingData = () => {
    return bookings.filter(item => {
      if (stateFilter !== "all" && item.media?.state !== stateFilter) return false;
      if (districtFilter !== "all" && item.media?.district !== districtFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      
      // Payment Status Filter
      if (paymentStatusFilter !== "all" && item.paymentStatus !== paymentStatusFilter) return false;

      if (dateRange.start && new Date(item.startDate) < new Date(dateRange.start)) return false;
      if (dateRange.end && new Date(item.endDate) > new Date(dateRange.end)) return false;
      return true;
    });
  };

  // 3. Customer Report Data
  const getCustomerReportData = () => {
    return bookings.filter(item => {
      if (customerFilter !== "all" && item.customerId !== customerFilter) return false;
      if (typeFilter !== "all" && item.media?.type !== typeFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      
      // Payment Status Filter
      if (paymentStatusFilter !== "all" && item.paymentStatus !== paymentStatusFilter) return false;

      if (dateRange.start && new Date(item.startDate) < new Date(dateRange.start)) return false;
      if (dateRange.end && new Date(item.endDate) > new Date(dateRange.end)) return false;
      return true;
    });
  };

  // 4. Group Report Data
  const getGroupReportData = () => {
    // First find all customers belonging to the selected group(s)
    const targetCustomers = customers.filter(c => {
      if (groupFilter !== "all" && (c.group || "Uncategorized") !== groupFilter) return false;
      return true;
    });
    
    const targetCustomerIds = targetCustomers.map(c => c.id);

    // Filter bookings belonging to these customers
    return bookings.filter(item => {
      if (!targetCustomerIds.includes(item.customerId)) return false;
      if (typeFilter !== "all" && item.media?.type !== typeFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;

      // Payment Status Filter
      if (paymentStatusFilter !== "all" && item.paymentStatus !== paymentStatusFilter) return false;

      if (dateRange.start && new Date(item.startDate) < new Date(dateRange.start)) return false;
      if (dateRange.end && new Date(item.endDate) > new Date(dateRange.end)) return false;
      return true;
    });
  };

  const inventoryData = getInventoryData();
  const bookingData = getBookingData();
  const customerData = getCustomerReportData();
  const groupData = getGroupReportData();

  // --- Export Functions ---

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).filter(key => typeof data[0][key] !== 'object');
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(fieldName => {
        const value = row[fieldName]?.toString() || '';
        return `"${value.replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = () => {
    if (activeTab === "inventory") {
      const cleanData = inventoryData.map(m => ({
        ID: m.id, Name: m.name, Type: m.type, State: m.state, District: m.district, City: m.city, Status: m.status, Price: m.pricePerMonth
      }));
      downloadCSV(cleanData, "Media_Inventory_Report");
    } else if (activeTab === "bookings") {
      const cleanData = bookingData.map(b => ({
        BookingID: b.id, 
        MediaID: b.mediaId, 
        MediaName: b.media?.name, 
        District: b.media?.district, 
        StartDate: b.startDate, 
        EndDate: b.endDate, 
        BookingStatus: b.status, 
        ContractAmount: b.amount,
        // Added Payment Details
        PaymentStatus: b.paymentStatus,
        PaidAmount: b.amountPaid,
        BalanceDue: b.amount - b.amountPaid,
        PaymentMode: b.paymentMode || 'N/A'
      }));
      downloadCSV(cleanData, "Booking_History_Report");
    } else if (activeTab === "customers") {
      const cleanData = customerData.map(b => {
        // Changed to use Company Name
        const custCompany = customers.find(c => c.id === b.customerId)?.company || "Unknown";
        return {
          Client: custCompany, 
          BookingID: b.id, 
          MediaType: b.media?.type, 
          Location: `${b.media?.city}, ${b.media?.district}`, 
          StartDate: b.startDate, 
          EndDate: b.endDate, 
          BookingStatus: b.status, 
          // Added Payment Details
          ContractAmount: b.amount,
          PaymentStatus: b.paymentStatus,
          PaidAmount: b.amountPaid,
          BalanceDue: b.amount - b.amountPaid
        };
      });
      downloadCSV(cleanData, customerFilter !== "all" ? `Customer_Report_${customerFilter}` : "All_Customers_Report");
    } else if (activeTab === "groups") {
      const cleanData = groupData.map(b => {
        const customer = customers.find(c => c.id === b.customerId);
        return {
          Group: customer?.group || "Uncategorized",
          Company: customer?.company || "Unknown",
          BookingID: b.id,
          MediaType: b.media?.type,
          BookingStatus: b.status,
          // Added Payment Details
          ContractAmount: b.amount,
          PaymentStatus: b.paymentStatus,
          PaidAmount: b.amountPaid,
          BalanceDue: b.amount - b.amountPaid
        };
      });
      downloadCSV(cleanData, groupFilter !== "all" ? `Group_Report_${groupFilter}` : "All_Groups_Report");
    }
  };

  return (
    <div className="space-y-6 print:space-y-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">Reports Center</h1>
          <p className="text-muted-foreground">Generate and export detailed insights about your inventory and bookings.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print / PDF
          </Button>
          <Button onClick={handleDownload}>
            <FileDown className="h-4 w-4 mr-2" /> Download Excel/CSV
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="print:hidden">
           <TabsList>
            <TabsTrigger value="inventory">Media Inventory</TabsTrigger>
            <TabsTrigger value="bookings">Booking History</TabsTrigger>
            <TabsTrigger value="customers">Customer Reports</TabsTrigger>
            <TabsTrigger value="groups">Group Reports</TabsTrigger>
          </TabsList>
        </div>

        <Card className="print:hidden bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" /> Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Group Selector (Only on Groups Tab) */}
              {activeTab === "groups" && (
                <div className="space-y-2">
                  <Label>Customer Group</Label>
                  <Select value={groupFilter} onValueChange={setGroupFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Groups" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Groups</SelectItem>
                      {customerGroups.map(g => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Customer Search (Only on Customers Tab) */}
              {activeTab === "customers" && (
                <div className="space-y-2 flex flex-col">
                  <Label>Customer (Company)</Label>
                  <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={customerOpen} className="w-full justify-between font-normal">
                        {customerFilter !== "all" ? customers.find((c) => c.id === customerFilter)?.company : "All Customers"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Search company..." />
                        <CommandList>
                          <CommandEmpty>No company found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem value="all customers" onSelect={() => { setCustomerFilter("all"); setCustomerOpen(false); }}>
                              <Check className={cn("mr-2 h-4 w-4", customerFilter === "all" ? "opacity-100" : "opacity-0")} /> All Customers
                            </CommandItem>
                            {customers.map((customer) => (
                              <CommandItem key={customer.id} value={customer.company} onSelect={() => { setCustomerFilter(customer.id); setCustomerOpen(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", customerFilter === customer.id ? "opacity-100" : "opacity-0")} /> {customer.company}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* State Search (Not on Customers or Groups Tab) */}
              {activeTab !== "customers" && activeTab !== "groups" && (
                <div className="space-y-2 flex flex-col">
                  <Label>State</Label>
                  <Popover open={stateOpen} onOpenChange={setStateOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={stateOpen} className="w-full justify-between font-normal">
                        {stateFilter !== "all" ? stateFilter : "All States"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search state..." />
                        <CommandList>
                          <CommandEmpty>No state found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem value="all states" onSelect={() => { setStateFilter("all"); setDistrictFilter("all"); setStateOpen(false); }}>
                              <Check className={cn("mr-2 h-4 w-4", stateFilter === "all" ? "opacity-100" : "opacity-0")} /> All States
                            </CommandItem>
                            {states.map((state) => (
                              <CommandItem key={state} value={state} onSelect={() => { setStateFilter(state); setDistrictFilter("all"); setStateOpen(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", stateFilter === state ? "opacity-100" : "opacity-0")} /> {state}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* District Search (Not on Customers or Groups Tab) */}
              {activeTab !== "customers" && activeTab !== "groups" && (
                <div className="space-y-2 flex flex-col">
                  <Label>District</Label>
                  <Popover open={districtOpen} onOpenChange={setDistrictOpen}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        role="combobox" 
                        aria-expanded={districtOpen} 
                        className="w-full justify-between font-normal"
                        disabled={stateFilter === "all"}
                      >
                        {districtFilter !== "all" ? districtFilter : "All Districts"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search district..." />
                        <CommandList>
                          <CommandEmpty>No district found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem value="all districts" onSelect={() => { setDistrictFilter("all"); setDistrictOpen(false); }}>
                              <Check className={cn("mr-2 h-4 w-4", districtFilter === "all" ? "opacity-100" : "opacity-0")} /> All Districts
                            </CommandItem>
                            {availableDistricts.map((district) => (
                              <CommandItem key={district} value={district} onSelect={() => { setDistrictFilter(district); setDistrictOpen(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", districtFilter === district ? "opacity-100" : "opacity-0")} /> {district}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Media Type */}
              {(activeTab === "inventory" || activeTab === "customers" || activeTab === "groups") && (
                <div className="space-y-2">
                  <Label>Media Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {mediaTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Status */}
              <div className="space-y-2">
                <Label>Booking Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {activeTab === "inventory" ? (
                      <>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Booked">Booked</SelectItem>
                        <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Upcoming">Upcoming</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* NEW: Payment Status Filter (Only when not in inventory) */}
              {activeTab !== "inventory" && (
                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                    <SelectTrigger><SelectValue placeholder="All Payments" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payments</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Date Filters */}
            {(activeTab === "bookings" || activeTab === "customers" || activeTab === "groups") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
                <div className="space-y-2">
                  <Label>Start Date (From)</Label>
                  <Input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>End Date (To)</Label>
                  <Input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tab Contents */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Media Inventory Report</CardTitle>
              <CardDescription>Showing {inventoryData.length} locations.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryData.slice(0, 50).map((media) => (
                      <TableRow key={media.id}>
                        <TableCell className="font-mono text-xs">{media.id}</TableCell>
                        <TableCell className="font-medium">{media.name}</TableCell>
                        <TableCell>{media.type}</TableCell>
                        <TableCell>{media.city}, {media.district}</TableCell>
                        <TableCell>
                          <Badge variant={media.status === 'Available' ? 'success' : media.status === 'Booked' ? 'destructive' : 'warning'}>
                            {media.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">₹{media.pricePerMonth.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking History Report</CardTitle>
              <CardDescription>Showing {bookingData.length} bookings.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Media</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      {/* Added Payment Columns */}
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Paid / Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookingData.slice(0, 50).map((booking) => {
                      const balance = booking.amount - booking.amountPaid;
                      return (
                        <TableRow key={booking.id}>
                          <TableCell className="font-mono text-xs">{booking.id}</TableCell>
                          <TableCell>
                            <div className="font-medium">{booking.media?.name}</div>
                            <div className="text-xs text-muted-foreground">{booking.media?.district}</div>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="text-xs">{booking.startDate}</div>
                            <div className="text-xs text-muted-foreground">{booking.endDate}</div>
                          </TableCell>
                          <TableCell><Badge variant={booking.status === 'Active' ? 'success' : 'outline'}>{booking.status}</Badge></TableCell>
                          
                          {/* Payment Data */}
                          <TableCell>
                            <Badge 
                              variant={
                                booking.paymentStatus === 'Paid' ? 'success' : 
                                booking.paymentStatus === 'Partially Paid' ? 'warning' : 'destructive'
                              }
                              className="text-[10px]"
                            >
                              {booking.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                             <div className="text-xs font-medium text-success">₹{booking.amountPaid.toLocaleString()}</div>
                             {balance > 0 && <div className="text-xs text-destructive">Due: ₹{balance.toLocaleString()}</div>}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Customer Performance Report</CardTitle>
                  <CardDescription>
                    {customerFilter === 'all' ? "Showing bookings for ALL customers." : `Showing bookings for ${customers.find(c => c.id === customerFilter)?.company}.`}
                  </CardDescription>
                </div>
                {customerFilter !== 'all' && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Spent (Filtered)</p>
                    <p className="text-xl font-bold">₹{customerData.reduce((sum, b) => sum + b.amountPaid, 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Contract Value: ₹{customerData.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client (Company)</TableHead>
                      <TableHead>Media</TableHead>
                      <TableHead>Status</TableHead>
                      {/* Added Payment Columns */}
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Paid / Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No bookings found for the selected criteria.</TableCell>
                      </TableRow>
                    ) : (
                      customerData.slice(0, 50).map((booking) => {
                         const customer = customers.find(c => c.id === booking.customerId);
                         return (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {/* Changed Icon to Building2 and Displayed Company Name */}
                                <Building2 className="h-3 w-3 text-muted-foreground" />
                                {customer?.company || "Unknown"}
                              </div>
                              <div className="text-xs text-muted-foreground ml-5">{booking.id}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{booking.media?.type}</div>
                              <div className="text-xs text-muted-foreground">{booking.media?.city}</div>
                            </TableCell>
                            <TableCell><Badge variant={booking.status === 'Active' ? 'success' : booking.status === 'Completed' ? 'secondary' : 'outline'}>{booking.status}</Badge></TableCell>
                            
                            {/* Payment Data */}
                            <TableCell>
                              <Badge 
                                variant={
                                  booking.paymentStatus === 'Paid' ? 'success' : 
                                  booking.paymentStatus === 'Partially Paid' ? 'warning' : 'destructive'
                                }
                                className="text-[10px]"
                              >
                                {booking.paymentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="font-medium">₹{booking.amountPaid.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">of ₹{booking.amount.toLocaleString()}</div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Customer Group Analysis</CardTitle>
                  <CardDescription>
                    {groupFilter === 'all' ? "Showing booking data across all sectors." : `Showing data for the ${groupFilter} sector.`}
                  </CardDescription>
                </div>
                <div className="flex gap-4 text-right">
                   <div>
                     <p className="text-xs text-muted-foreground">Total Bookings</p>
                     <p className="text-lg font-bold flex items-center justify-end"><Briefcase className="h-4 w-4 mr-1 text-primary" />{groupData.length}</p>
                   </div>
                   <div>
                     <p className="text-xs text-muted-foreground">Total Revenue (Paid)</p>
                     <p className="text-lg font-bold flex items-center justify-end"><IndianRupee className="h-4 w-4 mr-1 text-success" />{(groupData.reduce((sum, b) => sum + b.amountPaid, 0))}L</p>
                   </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Media Type</TableHead>
                      <TableHead>Status</TableHead>
                      {/* Added Payment Columns */}
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Paid / Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No bookings found for the selected group.</TableCell>
                      </TableRow>
                    ) : (
                      groupData.slice(0, 50).map((booking) => {
                         const customer = customers.find(c => c.id === booking.customerId);
                         const balance = booking.amount - booking.amountPaid;
                         return (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{customer?.company || "Unknown"}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className="font-normal">{customer?.group || "N/A"}</Badge>
                            </TableCell>
                            <TableCell>{booking.media?.type}</TableCell>
                            <TableCell><Badge variant={booking.status === 'Active' ? 'success' : booking.status === 'Completed' ? 'secondary' : 'outline'}>{booking.status}</Badge></TableCell>
                            
                            {/* Payment Data */}
                            <TableCell>
                              <Badge 
                                variant={
                                  booking.paymentStatus === 'Paid' ? 'success' : 
                                  booking.paymentStatus === 'Partially Paid' ? 'warning' : 'destructive'
                                }
                                className="text-[10px]"
                              >
                                {booking.paymentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                               <div className="text-xs font-medium">₹{booking.amountPaid.toLocaleString()}</div>
                               {balance > 0 && <div className="text-xs text-destructive">Bal: ₹{balance.toLocaleString()}</div>}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}