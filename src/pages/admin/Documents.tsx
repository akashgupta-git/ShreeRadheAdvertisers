/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, CheckCircle2, Search, Download, AlertCircle, Upload, Plus, FilterX, Clock, Trash2, Filter, Loader2, Save, MapPin, Pencil, Eye
} from "lucide-react";

// DATA & TYPES
import { TenderAgreement, TaxStatus, TenderStatus, TaxRecord, ComplianceStats, CentralBinItem } from "@/lib/api/types";
import { cn } from "@/lib/utils";

// COMPONENTS & HOOKS
import { RecycleBinDialog } from "@/components/admin/RecycleBinDialog";
import { LocationManagementDialog } from "@/components/admin/LocationManagement";
import { toast } from "@/hooks/use-toast";
import { useUploadDocument } from "@/hooks/api/useMedia"; 
import { useLocationData } from "@/contexts/LocationDataContext";
import { 
  useCompliance, 
  useDeleteCompliance, 
  useRestoreCompliance, 
  useUpdateAgreement,
  usePermanentDeleteCompliance 
} from "@/hooks/api/useCompliance"; 

const Documents = () => {
  // --- HOOKS ---
  const queryClient = useQueryClient();
  const uploadDoc = useUploadDocument();
  const updateAgreementMutation = useUpdateAgreement();
  const { states, getDistrictsForState, getCitiesForDistrict, activeState } = useLocationData();
  
  const { data: complianceData, isLoading: isLoadingCompliance } = useCompliance();
  const deleteMutation = useDeleteCompliance();
  const restoreMutation = useRestoreCompliance();
  const permanentDeleteMutation = usePermanentDeleteCompliance();

  // --- STATE MANAGEMENT ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [agreements, setAgreements] = useState<TenderAgreement[]>([]);
  const [taxes, setTaxes] = useState<TaxRecord[]>([]);
  const [editingAgreement, setEditingAgreement] = useState<TenderAgreement | null>(null);
  
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
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [frequencyFilter, setFrequencyFilter] = useState<string>("all");

  const availableDistrictsForFilter = stateFilter !== "all" ? getDistrictsForState(stateFilter) : [];

  // --- DIALOG STATE ---
  const [isAgreementDialogOpen, setIsAgreementDialogOpen] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [payTaxId, setPayTaxId] = useState<string | null>(null);
  const [recycleBinOpen, setRecycleBinOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'agreement' | 'tax', id: string } | null>(null);

  const [dialogLocation, setDialogLocation] = useState({ state: activeState || 'Chhattisgarh', district: '', area: '' });

  // --- SYNC LOCAL STATE ---
  useEffect(() => {
    if (complianceData?.success) {
      setAgreements(complianceData.tenders || []);
      setTaxes(complianceData.taxes || []);
    }
  }, [complianceData]);

  // --- STATS CALCULATION ---
  useEffect(() => {
    const today = new Date();
    const activeAgreements = agreements.filter(a => !a.deleted);
    const activeTaxes = taxes.filter(t => !t.deleted);
    
    const expiring = activeAgreements.filter(t => {
      if (t.status === 'Expired') return false;
      const diff = new Date(t.endDate).getTime() - today.getTime();
      return Math.ceil(diff / (1000 * 3600 * 24)) <= 30;
    }).length;

    const totalPaid = activeTaxes
      .filter(t => t.status === 'Paid')
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    const totalUnpaid = activeTaxes
      .filter(t => t.status !== 'Paid')
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    setStats({
      expiringTenders: expiring,
      pendingTaxes: activeTaxes.filter(t => t.status === 'Pending').length,
      overdueTaxes: activeTaxes.filter(t => t.status === 'Overdue' || (t.status !== 'Paid' && new Date(t.dueDate) < today)).length,
      totalActiveTenders: activeAgreements.filter(t => t.status === 'Active').length,
      totalTaxLiability: totalUnpaid,
      totalTaxPaid: totalPaid
    });
  }, [agreements, taxes]);

  // --- HELPERS ---
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTaxStatusFilter("All");
    setAgreementStatusFilter("All");
    setStateFilter("all");
    setDistrictFilter("all");
    setFrequencyFilter("all");
  };

  const initiateDelete = (type: 'agreement' | 'tax', id: string) => { 
    setItemToDelete({ type, id }); 
    setDeleteAlertOpen(true); 
  };

  const handleEditClick = (tender: TenderAgreement) => {
    setEditingAgreement(tender);
    setDialogLocation({
      state: activeState || 'Chhattisgarh',
      district: tender.district,
      area: tender.area
    });
    setIsAgreementDialogOpen(true);
  };

  const handleDownload = async (url?: string, fileName?: string) => {
    if (!url) {
      toast({ title: "No file available", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      toast({ title: "Download Failed", variant: "destructive" });
    }
  };

  // --- FORM SUBMIT (Handles Create & Update with Optional File) ---
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!dialogLocation.district || !dialogLocation.area) {
        toast({ title: "Error", description: "Select location", variant: "destructive"});
        return;
    }

    // Required only on new creation
    if (!editingAgreement && !selectedFile) {
        toast({ title: "File Required", description: "Please upload the Agreement PDF", variant: "destructive"});
        return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      tenderName: formData.get('tenderName') as string,
      tenderNumber: formData.get('tenderNumber') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      licenseFee: formData.get('fee') as string,
      taxFrequency: formData.get('frequency') as string,
      district: dialogLocation.district,
      area: dialogLocation.area,
    };

    try {
      if (editingAgreement) {
        // If editing and a file is selected, we need to upload the new file first or use a multipart update mutation
        // For simplicity, we use updateAgreementMutation for metadata. 
        // Note: If you want to replace the file on edit, your useUpdateAgreement hook must support FormData or handle file upload.
        await updateAgreementMutation.mutateAsync({ 
          id: editingAgreement.id, 
          data: { ...payload, file: selectedFile } 
        });
        toast({ title: "Updated", description: "Agreement updated successfully." });
      } else {
        await uploadDoc.mutateAsync({ 
          file: selectedFile!, 
          customId: payload.tenderNumber, 
          ...payload, 
          type: 'tender' 
        });
        toast({ title: "Success", description: "New Agreement generated." });
      }
      queryClient.invalidateQueries({ queryKey: ['compliance'] });
      setIsAgreementDialogOpen(false);
      setEditingAgreement(null);
      setSelectedFile(null);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RECYCLE BIN ACTIONS ---
  const handleRestore = async (id: string, type: CentralBinItem['type']) => {
    try {
      await restoreMutation.mutateAsync({ id, type: type as any });
      toast({ title: "Restored", description: "Item moved back to active records." });
    } catch (err) { 
      toast({ variant: "destructive", title: "Restore Failed" }); 
    }
  };

  const handlePermanentDelete = async (id: string, type: CentralBinItem['type']) => {
    try {
      await permanentDeleteMutation.mutateAsync({ id, type: type as any });
      toast({ title: "Purged", description: "Item removed permanently.", variant: "destructive" });
    } catch (err) { 
      toast({ variant: "destructive", title: "Purge Failed" }); 
    }
  };

  const handleRestoreAll = async () => {
    const deletedItems = allDeletedItems;
    try {
      await Promise.all(deletedItems.map(item => restoreMutation.mutateAsync({ id: item.id, type: item.type as any })));
      toast({ title: "Success", description: "All items restored." });
    } catch (err) { 
      toast({ variant: "destructive", title: "Bulk Restore Failed" }); 
    }
  };

  const handleDeleteAllPermanently = async () => {
    const deletedItems = allDeletedItems;
    try {
      await Promise.all(deletedItems.map(item => permanentDeleteMutation.mutateAsync({ id: item.id, type: item.type as any })));
      toast({ title: "Purged", description: "Recycle bin emptied.", variant: "destructive" });
    } catch (err) { 
      toast({ variant: "destructive", title: "Bulk Purge Failed" }); 
    }
  };

  const handlePaySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!payTaxId || !selectedFile) return;
    const targetTax = taxes.find(t => t.id === payTaxId);
    if (!targetTax) return;
    setIsSubmitting(true);
    try {
      await uploadDoc.mutateAsync({
        file: selectedFile,
        customId: targetTax.tenderNumber,
        district: targetTax.district,
        type: 'tax',
        taxId: payTaxId,
        licenseFee: targetTax.amount.toString()
      });
      queryClient.invalidateQueries({ queryKey: ['compliance'] });
      setIsPayDialogOpen(false); 
      setSelectedFile(null);
      toast({ title: "Paid", description: "Tax registry updated." });
    } catch (err: any) { 
        toast({ variant: "destructive", title: "Update Failed" }); 
    } finally { 
        setIsSubmitting(false); 
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteMutation.mutateAsync({ id: itemToDelete.id, type: itemToDelete.type as any });
      setDeleteAlertOpen(false); 
      setItemToDelete(null);
      toast({ title: "Moved to Recycle Bin" });
    } catch (err) { 
      toast({ variant: "destructive", title: "Delete Failed" }); 
    }
  };

  // --- DATA FILTERING ---
  const filteredTenders = agreements.filter(a => !a.deleted).filter(t => {
    const matchesSearch = t.district.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.area.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.tenderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.tenderName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = agreementStatusFilter === "All" || t.status === agreementStatusFilter;
    const matchesDistrict = districtFilter === "all" || t.district === districtFilter;
    const matchesFrequency = frequencyFilter === "all" || t.taxFrequency === frequencyFilter;
    return matchesSearch && matchesStatus && matchesDistrict && matchesFrequency;
  });

  const filteredTaxes = taxes.filter(t => !t.deleted).filter(t => {
    const matchesSearch = t.tenderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || t.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTaxStatus = taxStatusFilter === "All" || t.status === taxStatusFilter;
    const matchesDistrict = districtFilter === "all" || t.district === districtFilter;
    return matchesSearch && matchesTaxStatus && matchesDistrict;
  });

  const allDeletedItems: CentralBinItem[] = [
    ...agreements.filter(a => a.deleted).map(a => ({ id: a.id, type: 'agreement' as any, displayName: a.tenderName || "Agreement", subText: `${a.district}`, deletedAt: a.deletedAt || new Date().toISOString() })),
    ...taxes.filter(t => t.deleted).map(t => ({ id: t.id, type: 'tax' as any, displayName: `Tax Record: ${t.tenderNumber}`, subText: `${t.district}`, deletedAt: t.deletedAt || new Date().toISOString() }))
  ];

  if (isLoadingCompliance) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Documents & Compliance</h1>
          <p className="text-muted-foreground">Manage tender agreements and track tax liabilities from MongoDB</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setLocationDialogOpen(true)}><MapPin className="h-4 w-4 mr-2" /> Locations</Button>
          <Button onClick={() => { setEditingAgreement(null); setSelectedFile(null); setDialogLocation({state: activeState, district: '', area: ''}); setIsAgreementDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> New Agreement
          </Button>
        </div>
      </div>

      {/* --- CLICKABLE STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-all active:scale-[0.98]" onClick={() => { setActiveTab("agreements"); setAgreementStatusFilter("Active"); }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active Agreements</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalActiveTenders}</div></CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-orange-500/50 transition-all active:scale-[0.98]" onClick={() => { setActiveTab("taxes"); setTaxStatusFilter("Pending"); }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Current Liability</CardTitle><AlertCircle className="h-4 w-4 text-orange-500" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹{stats.totalTaxLiability.toLocaleString('en-IN')}</div></CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-green-500/50 transition-all active:scale-[0.98]" onClick={() => { setActiveTab("taxes"); setTaxStatusFilter("Paid"); }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Tax Paid</CardTitle><CheckCircle2 className="h-4 w-4 text-green-500" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹{stats.totalTaxPaid.toLocaleString('en-IN')}</div></CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-destructive/50 transition-all active:scale-[0.98]" onClick={() => { setActiveTab("taxes"); setTaxStatusFilter("Overdue"); }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Overdue Taxes</CardTitle><Clock className="h-4 w-4 text-destructive" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-destructive">{stats.overdueTaxes}</div></CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <TabsList><TabsTrigger value="agreements">Agreements</TabsTrigger><TabsTrigger value="taxes">Tax Registry</TabsTrigger></TabsList>
          <div className="flex items-center gap-2">
            <div className="relative w-64"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" /></div>
            {(searchTerm || stateFilter !== "all" || districtFilter !== "all" || taxStatusFilter !== "All" || agreementStatusFilter !== "All" || frequencyFilter !== "all") && (
                <Button variant="ghost" size="icon" onClick={clearFilters}><FilterX className="h-4 w-4 text-destructive" /></Button>
            )}
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
                <SelectContent><SelectItem value="all">All Frequencies</SelectItem><SelectItem value="Monthly">Monthly</SelectItem><SelectItem value="Quarterly">Quarterly</SelectItem><SelectItem value="Yearly">Yearly</SelectItem></SelectContent>
              </Select>
            </div>
          </Card>

          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Agreement Name</TableHead><TableHead>Ref Number</TableHead><TableHead>Location</TableHead><TableHead>Valid Until</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredTenders.map((tender) => (
                  <TableRow key={tender.id}>
                    <TableCell className="font-medium">{tender.tenderName}</TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">{tender.tenderNumber}</TableCell>
                    <TableCell>{tender.district}, {tender.area}</TableCell>
                    <TableCell>{formatDate(tender.endDate)}</TableCell>
                    <TableCell><Badge variant={tender.status === 'Active' ? 'success' : 'warning'}>{tender.status}</Badge></TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2">
                         <Button variant="outline" size="sm" onClick={() => window.open(tender.documentUrl, '_blank')}>
                           <Eye className="h-3 w-3 mr-1" /> View
                         </Button>
                         <Button variant="outline" size="sm" onClick={() => handleDownload(tender.documentUrl, `${tender.tenderNumber}_agreement.pdf`)}>
                           <Download className="h-3 w-3 mr-1" /> Download
                         </Button>
                         <Button variant="ghost" size="icon" onClick={() => handleEditClick(tender)}><Pencil className="h-4 w-4" /></Button>
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
          <Card className="p-4 bg-muted/20 border-border/50 mb-4 flex gap-4">
              <Select value={taxStatusFilter} onValueChange={(v: any) => setTaxStatusFilter(v)}>
                <SelectTrigger className="w-[140px] bg-background"><SelectValue placeholder="Tax Status" /></SelectTrigger>
                <SelectContent><SelectItem value="All">All Status</SelectItem><SelectItem value="Paid">Paid</SelectItem><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Overdue">Overdue</SelectItem></SelectContent>
              </Select>
              <Select value={districtFilter} onValueChange={setDistrictFilter}>
                <SelectTrigger className="w-[150px] bg-background"><SelectValue placeholder="District" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Districts</SelectItem>{Array.from(new Set(taxes.map(t => t.district))).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
          </Card>
          <Card>
             <Table>
                <TableHeader><TableRow><TableHead>Receipt / Ref</TableHead><TableHead>Location</TableHead><TableHead>Amount</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                    {filteredTaxes.map((tax) => (
                        <TableRow key={tax.id}>
                            <TableCell className="font-medium">{tax.tenderNumber}</TableCell>
                            <TableCell>{tax.district} - {tax.area}</TableCell>
                            <TableCell>₹{tax.amount.toLocaleString()}</TableCell>
                            <TableCell className={cn(tax.status === 'Overdue' && "text-red-600 font-bold")}>{formatDate(tax.dueDate)}</TableCell>
                            <TableCell><Badge variant={tax.status === 'Paid' ? 'outline' : 'warning'} className={tax.status === 'Paid' ? 'bg-green-100' : ''}>{tax.status}</Badge></TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    {tax.status !== 'Paid' ? (
                                        <Button size="sm" onClick={() => { setPayTaxId(tax.id); setSelectedFile(null); setIsPayDialogOpen(true); }}>Mark Paid</Button>
                                    ) : (
                                      <>
                                        <Button variant="outline" size="sm" onClick={() => window.open(tax.receiptUrl, '_blank')}>
                                          <Eye className="h-3 w-3 mr-1" /> View
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDownload(tax.receiptUrl, `${tax.tenderNumber}_receipt.pdf`)}>
                                          <Download className="h-3 w-3 mr-1" /> Download
                                        </Button>
                                      </>
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

      {/* --- AGREEMENT DIALOG (Fixed Edit PDF Option) --- */}
      <Dialog open={isAgreementDialogOpen} onOpenChange={(val) => { setIsAgreementDialogOpen(val); if(!val) setEditingAgreement(null); }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingAgreement ? 'Edit Agreement' : 'New Tender Agreement'}</DialogTitle>
            <DialogDescription>
              {editingAgreement ? "Modify the existing agreement details or upload a new PDF." : "Enter tender details and upload the agreement PDF."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Agreement Name</Label><Input name="tenderName" defaultValue={editingAgreement?.tenderName} required /></div>
                <div className="space-y-2"><Label>Reference Number *</Label><Input name="tenderNumber" defaultValue={editingAgreement?.tenderNumber} required /></div>
             </div>
             <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>State *</Label>
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
                    <Label>Town *</Label>
                    <Select value={dialogLocation.area} onValueChange={(v) => setDialogLocation({...dialogLocation, area: v})} disabled={!dialogLocation.district}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{getCitiesForDistrict(dialogLocation.district).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Start Date</Label><Input name="startDate" type="date" defaultValue={editingAgreement?.startDate?.split('T')[0]} required /></div>
                <div className="space-y-2"><Label>End Date</Label><Input name="endDate" type="date" defaultValue={editingAgreement?.endDate?.split('T')[0]} required /></div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Annual Fee</Label><Input name="fee" type="number" defaultValue={editingAgreement?.licenseFee} required /></div>
                <div className="space-y-2"><Label>Frequency</Label>
                    <Select name="frequency" defaultValue={editingAgreement?.taxFrequency || "Quarterly"}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Monthly">Monthly</SelectItem><SelectItem value="Quarterly">Quarterly</SelectItem><SelectItem value="Yearly">Yearly</SelectItem></SelectContent>
                    </Select>
                </div>
             </div>
             
             {/* File Upload (Always visible, mandatory for new, optional for edit) */}
             <div className="space-y-2">
                <Label>Agreement PDF {editingAgreement && "(Optional - upload to replace)"}</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center relative hover:bg-muted/50 cursor-pointer">
                    <Input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm">{selectedFile ? selectedFile.name : 'Click to select PDF'}</p>
                </div>
                {editingAgreement && !selectedFile && (
                  <p className="text-xs text-muted-foreground">Current file will be kept if no new file is selected.</p>
                )}
             </div>

             <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />} 
                    {editingAgreement ? 'Update Agreement' : 'Save to Database'}
                </Button>
             </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <LocationManagementDialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen} />
      <RecycleBinDialog 
        open={recycleBinOpen} 
        onOpenChange={setRecycleBinOpen} 
        deletedItems={allDeletedItems} 
        onRestore={handleRestore} 
        onPermanentDelete={handlePermanentDelete}
        onRestoreAll={handleRestoreAll}
        onDeleteAll={handleDeleteAllPermanently}
      />
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Recycle Bin?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive">Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Mark Tax as Paid</DialogTitle>
             <DialogDescription>Upload the payment receipt below.</DialogDescription>
           </DialogHeader>
           <form onSubmit={handlePaySubmit} className="space-y-4">
              <div className="space-y-2"><Label>Upload Receipt (PDF)</Label>
                 <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center relative hover:bg-muted/50 cursor-pointer">
                    <Input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" /><p className="text-sm">{selectedFile ? selectedFile.name : 'Choose Receipt PDF'}</p>
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