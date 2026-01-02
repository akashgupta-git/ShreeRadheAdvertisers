/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Download, 
  AlertCircle,
  Upload,
  Plus,
  FilterX,
  Pencil,
  Clock,
  Trash2,
  MoreVertical,
  ArchiveRestore,
  Filter,
  Loader2,
  Save,
  MapPin
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// DATA & TYPES
import { tenders as initialTenders, taxRecords as initialTaxes } from "@/lib/data";
import { TenderAgreement, TaxStatus, TenderStatus, TaxRecord, TaxFrequency, ComplianceStats, CentralBinItem } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { isBackendConfigured } from "@/lib/api/config";

// COMPONENTS & HOOKS
import { RecycleBinDialog } from "@/components/admin/RecycleBinDialog";
import { LocationManagementDialog } from "@/components/admin/LocationManagement";
import { toast } from "@/hooks/use-toast";
import { useUploadDocument } from "@/hooks/api/useMedia"; 
import { useLocationData } from "@/contexts/LocationDataContext";

const Documents = () => {
  // --- HOOKS ---
  const uploadDoc = useUploadDocument();
  const { states, getDistrictsForState, getCitiesForDistrict, activeState } = useLocationData();
  
  // --- STATE MANAGEMENT ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  
  // Initial state pulled from static data; in a full setup, you would fetch these from the API on mount
  const [agreements, setAgreements] = useState<TenderAgreement[]>(initialTenders);
  const [taxes, setTaxes] = useState<TaxRecord[]>(initialTaxes);
  
  const [stats, setStats] = useState<ComplianceStats>({
    expiringTenders: 0,
    pendingTaxes: 0,
    overdueTaxes: 0,
    totalActiveTenders: 0,
    totalTaxLiability: 0,
    totalTaxPaid: 0
  });

  // --- FILTER STATE ---
  const [activeTab, setActiveTab] = useState("agreements");
  const [searchTerm, setSearchTerm] = useState("");
  const [taxStatusFilter, setTaxStatusFilter] = useState<TaxStatus | "All">("All");
  const [agreementStatusFilter, setAgreementStatusFilter] = useState<TenderStatus | "All">("All");
  const [generalStatusFilter, setGeneralStatusFilter] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [frequencyFilter, setFrequencyFilter] = useState<string>("all");

  const availableDistrictsForFilter = stateFilter !== "all" ? getDistrictsForState(stateFilter) : [];

  // --- DIALOG STATE ---
  const [isAgreementDialogOpen, setIsAgreementDialogOpen] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState<TenderAgreement | null>(null);
  const [isTaxDialogOpen, setIsTaxDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxRecord | null>(null);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [payTaxId, setPayTaxId] = useState<string | null>(null);
  const [recycleBinOpen, setRecycleBinOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'agreement' | 'tax', id: string } | null>(null);

  // Managed Location for Dialog Creation
  const [dialogLocation, setDialogLocation] = useState({
    state: activeState || 'Chhattisgarh',
    district: '',
    area: ''
  });

  // --- EFFECT: RECALCULATE STATS ---
  useEffect(() => {
    const today = new Date();
    const activeAgreements = agreements.filter(a => !a.deleted);
    const activeTaxes = taxes.filter(t => !t.deleted);
    const expiring = activeAgreements.filter(t => {
      if (t.status === 'Expired') return false;
      const diff = new Date(t.endDate).getTime() - today.getTime();
      return Math.ceil(diff / (1000 * 3600 * 24)) <= 30;
    }).length;
    setStats({
      expiringTenders: expiring,
      pendingTaxes: activeTaxes.filter(t => t.status === 'Pending').length,
      overdueTaxes: activeTaxes.filter(t => t.status === 'Overdue').length,
      totalActiveTenders: activeAgreements.filter(t => t.status === 'Active').length,
      totalTaxLiability: activeTaxes.filter(t => t.status !== 'Paid').reduce((acc, t) => acc + t.amount, 0),
      totalTaxPaid: activeTaxes.filter(t => t.status === 'Paid').reduce((acc, t) => acc + t.amount, 0)
    });
  }, [agreements, taxes]);

  // --- PERSISTENT HANDLERS ---
  const handleCreateAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dialogLocation.district || !dialogLocation.area) {
        toast({ title: "Error", description: "Select State, District and Town", variant: "destructive"});
        return;
    }
    
    if (!selectedFile) {
        toast({ title: "File Required", description: "Please upload the Agreement PDF", variant: "destructive"});
        return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const tenderNumber = formData.get('tenderNumber') as string;

    try {
      // 1. Upload to Cloudinary AND Save to MongoDB via the unified backend route
      const uploadRes: any = await uploadDoc.mutateAsync({
        file: selectedFile,
        customId: tenderNumber,
        district: dialogLocation.district,
        type: 'tender',
        // Pass extra metadata for the backend to create the MongoDB record
        tenderName: formData.get('tenderName') as string,
        area: dialogLocation.area,
        startDate: formData.get('startDate') as string,
        endDate: formData.get('endDate') as string,
        taxFrequency: formData.get('frequency') as string,
        licenseFee: formData.get('fee') as string
      });

      // 2. Update local UI state with the persistent URL returned from server
      const newAgreement: TenderAgreement = {
        id: uploadRes.data?._id || `TND-${Date.now()}`,
        tenderName: formData.get('tenderName') as string,
        tenderNumber, 
        district: dialogLocation.district, 
        area: dialogLocation.area,
        startDate: formData.get('startDate') as string,
        endDate: formData.get('endDate') as string,
        taxFrequency: formData.get('frequency') as TaxFrequency,
        licenseFee: Number(formData.get('fee')),
        status: 'Active',
        mediaIds: [],
        documentUrl: uploadRes.url // Persistent Cloudinary URL
      };
      
      setAgreements(prev => [newAgreement, ...prev]);
      setIsAgreementDialogOpen(false);
      setSelectedFile(null);
      toast({ title: "Success", description: "Agreement organized and saved to Database." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payTaxId || !selectedFile) return;
    const targetTax = taxes.find(t => t.id === payTaxId);
    if (!targetTax) return;

    setIsSubmitting(true);
    try {
      // Send receipt to Cloudinary and update Tax record in MongoDB
      const uploadRes: any = await uploadDoc.mutateAsync({
        file: selectedFile,
        customId: targetTax.tenderNumber,
        district: targetTax.district,
        type: 'tax',
        licenseFee: targetTax.amount.toString()
      });

      setTaxes(prev => prev.map(t => t.id === payTaxId ? { 
        ...t, 
        status: 'Paid' as TaxStatus, 
        documentUrl: uploadRes.url, 
        paymentDate: new Date().toISOString().split('T')[0] 
      } : t));

      setIsPayDialogOpen(false); 
      setSelectedFile(null);
      toast({ title: "Paid", description: "Receipt saved to Cloudinary and Database." });
    } catch (err: any) { 
        toast({ variant: "destructive", title: "Upload Failed" }); 
    } finally { 
        setIsSubmitting(false); 
    }
  };

  // --- UI ACTIONS ---
  const clearFilters = () => { setSearchTerm(""); setGeneralStatusFilter(null); setTaxStatusFilter("All"); setAgreementStatusFilter("All"); setStateFilter("all"); setDistrictFilter("all"); setFrequencyFilter("all"); };
  const initiateDelete = (type: 'agreement' | 'tax', id: string) => { setItemToDelete({ type, id }); setDeleteAlertOpen(true); };
  
  const confirmDelete = () => {
    if (!itemToDelete) return;
    const deletedAt = new Date().toISOString();
    if (itemToDelete.type === 'agreement') {
      setAgreements(prev => prev.map(a => a.id === itemToDelete.id ? { ...a, deleted: true, deletedAt } : a));
      setTaxes(prev => prev.map(t => t.tenderId === itemToDelete.id ? { ...t, deleted: true, deletedAt } : t));
    } else {
      setTaxes(prev => prev.map(t => t.id === itemToDelete.id ? { ...t, deleted: true, deletedAt } : t));
    }
    setDeleteAlertOpen(false); setItemToDelete(null);
    toast({ title: "Moved to Recycle Bin" });
  };

  const handleRestore = (id: string, type: any) => {
    setAgreements(prev => prev.map(a => a.id === id ? { ...a, deleted: false } : a));
    setTaxes(prev => prev.map(t => (t.id === id || t.tenderId === id) ? { ...t, deleted: false } : t));
    toast({ title: "Restored" });
  };

  const handlePermanentDelete = (id: string, type: any) => {
    setAgreements(prev => prev.filter(a => a.id !== id));
    setTaxes(prev => prev.filter(t => t.id !== id && t.tenderId !== id));
    toast({ variant: "destructive", title: "Permanently Deleted" });
  };

  const filteredTenders = agreements.filter(a => !a.deleted).filter(t => {
    const matchesSearch = t.district.toLowerCase().includes(searchTerm.toLowerCase()) || t.area.toLowerCase().includes(searchTerm.toLowerCase()) || t.tenderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || t.tenderName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = generalStatusFilter ? t.status === generalStatusFilter : (agreementStatusFilter === "All" ? true : t.status === agreementStatusFilter);
    const matchesDistrict = districtFilter === "all" ? true : t.district === districtFilter;
    const matchesFrequency = frequencyFilter === "all" ? true : t.taxFrequency === frequencyFilter;
    return matchesSearch && matchesStatus && matchesDistrict && matchesFrequency;
  });

  const filteredTaxes = taxes.filter(t => !t.deleted).filter(t => {
    const matchesSearch = t.tenderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || t.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTaxStatus = taxStatusFilter !== "All" ? t.status === taxStatusFilter : true;
    const matchesAgreementStatus = agreementStatusFilter !== "All" ? t.agreementStatus === agreementStatusFilter : true;
    return matchesSearch && matchesTaxStatus && matchesAgreementStatus;
  });

  const allDeletedItems: CentralBinItem[] = [
    ...agreements.filter(a => a.deleted).map(a => ({ id: a.id, type: 'agreement' as any, displayName: a.tenderName || "Agreement", subText: `${a.district}, ${a.area}`, deletedAt: a.deletedAt || new Date().toISOString() })),
    ...taxes.filter(t => t.deleted).map(t => ({ id: t.id, type: 'tax' as any, displayName: `Tax Record: ${t.tenderNumber}`, subText: `${t.district} (${t.dueDate})`, deletedAt: t.deletedAt || new Date().toISOString() }))
  ];

  const getTaxStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid': return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case 'Pending': return <Badge variant="warning">Pending</Badge>;
      case 'Overdue': return <Badge variant="destructive">Overdue</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Documents & Compliance</h1>
          <p className="text-muted-foreground">Manage tender agreements and tax compliance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setLocationDialogOpen(true)}>
            <MapPin className="h-4 w-4 mr-2" /> Manage Locations
          </Button>
          <Button variant="outline" className="relative" onClick={() => setRecycleBinOpen(true)}>
            <ArchiveRestore className="h-4 w-4 mr-2" />
            Recycle Bin
            {allDeletedItems.length > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">{allDeletedItems.length}</span>}
          </Button>
          <Button onClick={() => { setEditingAgreement(null); setSelectedFile(null); setDialogLocation({state: activeState, district: '', area: ''}); setIsAgreementDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> New Agreement
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => { setActiveTab("agreements"); setGeneralStatusFilter("Active"); }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active Agreements</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalActiveTenders}</div></CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-orange-500/50" onClick={() => { setActiveTab("taxes"); setTaxStatusFilter("Pending"); }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Liability</CardTitle><AlertCircle className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹{stats.totalTaxLiability.toLocaleString('en-IN')}</div></CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-green-500/50" onClick={() => { setActiveTab("taxes"); setTaxStatusFilter("Paid"); }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Tax Paid</CardTitle><CheckCircle2 className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹{stats.totalTaxPaid.toLocaleString('en-IN')}</div></CardContent>
        </Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">System Status</CardTitle><Clock className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">Healthy</div></CardContent></Card>
      </div>

      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <TabsList><TabsTrigger value="agreements">Agreements</TabsTrigger><TabsTrigger value="taxes">Tax Registry</TabsTrigger></TabsList>
          <div className="flex items-center gap-2">
            <div className="relative w-64"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" /></div>
            {(searchTerm || stateFilter !== "all") && <Button variant="ghost" size="icon" onClick={clearFilters}><FilterX className="h-4 w-4 text-destructive" /></Button>}
          </div>
        </div>

        <TabsContent value="agreements" className="space-y-4">
          <Card className="p-4 bg-muted/20 border-border/50">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2"><Filter className="h-4 w-4" /> Filters:</div>
              <Select value={agreementStatusFilter} onValueChange={(v: any) => setAgreementStatusFilter(v)}>
                <SelectTrigger className="w-[140px] bg-background"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent><SelectItem value="All">All Status</SelectItem><SelectItem value="Active">Active</SelectItem><SelectItem value="Expiring Soon">Expiring Soon</SelectItem><SelectItem value="Expired">Expired</SelectItem></SelectContent>
              </Select>
              <Select value={stateFilter} onValueChange={(v) => { setStateFilter(v); setDistrictFilter("all"); }}>
                <SelectTrigger className="w-[150px] bg-background"><SelectValue placeholder="State" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All States</SelectItem>{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={districtFilter} onValueChange={setDistrictFilter} disabled={stateFilter === "all"}>
                <SelectTrigger className="w-[150px] bg-background"><SelectValue placeholder="District" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Districts</SelectItem>{availableDistrictsForFilter.map((d:string) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
                <SelectTrigger className="w-[150px] bg-background"><SelectValue placeholder="Frequency" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Frequencies</SelectItem><SelectItem value="Monthly">Monthly</SelectItem><SelectItem value="Quarterly">Quarterly</SelectItem><SelectItem value="Half-Yearly">Half-Yearly</SelectItem><SelectItem value="Yearly">Yearly</SelectItem><SelectItem value="One-Time">One-Time</SelectItem></SelectContent>
              </Select>
            </div>
          </Card>

          <Card>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Agreement Name</TableHead><TableHead>Ref Number</TableHead><TableHead>Location</TableHead><TableHead>Valid Until</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenders.map((tender) => (
                  <TableRow key={tender.id}>
                    <TableCell className="font-medium"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /><span>{tender.tenderName}</span></div></TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">{tender.tenderNumber}</TableCell>
                    <TableCell>{tender.district}, {tender.area}</TableCell>
                    <TableCell>{tender.endDate}</TableCell>
                    <TableCell><Badge variant={tender.status === 'Active' ? 'success' : 'warning'}>{tender.status}</Badge></TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2">
                         <Button variant="outline" size="sm" onClick={() => window.open(tender.documentUrl, '_blank')}><Download className="h-3 w-3 mr-1" /> View</Button>
                         <Button variant="ghost" size="icon" className="text-destructive" onClick={() => initiateDelete('agreement', tender.id)}><Trash2 className="h-4 w-4" /></Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="taxes">
           <Card>
             <Table>
                <TableHeader><TableRow><TableHead>Receipt / Ref</TableHead><TableHead>Location</TableHead><TableHead>Amount</TableHead><TableHead>Due Date</TableHead><TableHead>Tax Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                    {filteredTaxes.map((tax) => (
                        <TableRow key={tax.id}>
                            <TableCell className="font-medium">{tax.tenderNumber}</TableCell>
                            <TableCell>{tax.district} - {tax.area}</TableCell>
                            <TableCell>₹{tax.amount.toLocaleString()}</TableCell>
                            <TableCell className={cn(tax.status === 'Overdue' && "text-red-600 font-bold")}>{tax.dueDate}</TableCell>
                            <TableCell>{getTaxStatusBadge(tax.status)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    {tax.status !== 'Paid' ? (
                                        <Button size="sm" onClick={() => { setPayTaxId(tax.id); setSelectedFile(null); setIsPayDialogOpen(true); }}>Mark Paid</Button>
                                    ) : (
                                        <Button variant="ghost" size="sm" onClick={() => window.open(tax.documentUrl || tax.receiptUrl, '_blank')}><Download className="h-4 w-4" /></Button>
                                    )}
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => initiateDelete('tax', tax.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
           </Card>
        </TabsContent>
      </Tabs>

      {/* --- NEW AGREEMENT DIALOG --- */}
      <Dialog open={isAgreementDialogOpen} onOpenChange={setIsAgreementDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>New Tender Agreement</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateAgreement} className="space-y-4 py-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Agreement Name</Label><Input name="tenderName" required /></div>
                <div className="space-y-2"><Label>Reference Number *</Label><Input name="tenderNumber" required /></div>
             </div>

             <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>State *</Label>
                    <Select value={dialogLocation.state} onValueChange={(v) => setDialogLocation({state: v, district: '', area: ''})}>
                        <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                        <SelectContent>{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>District *</Label>
                    <Select value={dialogLocation.district} onValueChange={(v) => setDialogLocation({...dialogLocation, district: v, area: ''})} disabled={!dialogLocation.state}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{getDistrictsForState(dialogLocation.state).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Town / Tehsil *</Label>
                    <Select value={dialogLocation.area} onValueChange={(v) => setDialogLocation({...dialogLocation, area: v})} disabled={!dialogLocation.district}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{getCitiesForDistrict(dialogLocation.district).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Start Date</Label><Input name="startDate" type="date" required /></div>
                <div className="space-y-2"><Label>End Date</Label><Input name="endDate" type="date" required /></div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Annual Fee</Label><Input name="fee" type="number" required /></div>
                <div className="space-y-2"><Label>Frequency</Label>
                    <Select name="frequency" defaultValue="Quarterly">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Monthly">Monthly</SelectItem><SelectItem value="Quarterly">Quarterly</SelectItem><SelectItem value="Yearly">Yearly</SelectItem></SelectContent>
                    </Select>
                </div>
             </div>
             <div className="space-y-2">
                <Label>Agreement PDF</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center relative hover:bg-muted/50 cursor-pointer">
                    <Input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm">{selectedFile ? selectedFile.name : 'Click to select PDF'}</p>
                </div>
             </div>
             <DialogFooter><Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />} Create & Organize</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <LocationManagementDialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen} />
      <RecycleBinDialog open={recycleBinOpen} onOpenChange={setRecycleBinOpen} deletedItems={allDeletedItems} onRestore={handleRestore} onPermanentDelete={handlePermanentDelete} />
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirm Delete</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="bg-destructive">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      
      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
         <DialogContent>
           <DialogHeader><DialogTitle>Mark as Paid</DialogTitle></DialogHeader>
           <form onSubmit={handlePaySubmit} className="space-y-4">
              <div className="space-y-2">
                 <Label>Upload Receipt (PDF)</Label>
                 <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center relative hover:bg-muted/50 cursor-pointer">
                    <Input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm">{selectedFile ? selectedFile.name : 'Choose Receipt PDF'}</p>
                 </div>
              </div>
              <DialogFooter><Button type="submit" disabled={isSubmitting || !selectedFile}>{isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Confirm Payment'}</Button></DialogFooter>
           </form>
         </DialogContent>
      </Dialog>
    </div>
  );
};

export default Documents;