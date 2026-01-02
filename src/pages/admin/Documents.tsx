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
  FileText, AlertTriangle, CheckCircle2, Search, Download, AlertCircle,
  Upload, Plus, FilterX, Pencil, Clock, Trash2, MoreVertical, ArchiveRestore, Filter, Loader2 
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// DATA & TYPES
import { tenders as initialTenders, taxRecords as initialTaxes, states, districts } from "@/lib/data";
import { TenderAgreement, TaxStatus, TenderStatus, TaxRecord, TaxFrequency, ComplianceStats, CentralBinItem } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { isBackendConfigured } from "@/lib/api/config";

// COMPONENTS & HOOKS
import { RecycleBinDialog } from "@/components/admin/RecycleBinDialog";
import { toast } from "@/hooks/use-toast";
import { useUploadDocument } from "@/hooks/api/useMedia"; 

const Documents = () => {
  // --- API HOOKS ---
  const uploadDoc = useUploadDocument();
  
  // --- STATE MANAGEMENT ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [agreements, setAgreements] = useState<TenderAgreement[]>(initialTenders);
  const [taxes, setTaxes] = useState<TaxRecord[]>(initialTaxes);
  const [stats, setStats] = useState<ComplianceStats>({
    expiringTenders: 0, pendingTaxes: 0, overdueTaxes: 0,
    totalActiveTenders: 0, totalTaxLiability: 0, totalTaxPaid: 0
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

  const availableDistricts = stateFilter !== "all" ? (districts as any)[stateFilter] || [] : [];

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

  // --- UPLOAD HANDLERS ---
  const handleCreateAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const tenderNumber = formData.get('tenderNumber') as string;
    const district = formData.get('district') as string;

    try {
      let documentUrl = '#';
      if (selectedFile && isBackendConfigured()) {
        const uploadRes: any = await uploadDoc.mutateAsync({
          file: selectedFile,
          customId: tenderNumber,
          district: district,
          type: 'tender'
        });
        documentUrl = uploadRes.url;
      }

      const newAgreement: TenderAgreement = {
        id: `TND-${Date.now()}`,
        tenderName: formData.get('tenderName') as string,
        tenderNumber, district,
        area: formData.get('area') as string,
        startDate: formData.get('startDate') as string,
        endDate: formData.get('endDate') as string,
        taxFrequency: formData.get('frequency') as TaxFrequency,
        licenseFee: Number(formData.get('fee')),
        status: 'Active', mediaIds: [], documentUrl
      };
      
      setAgreements(prev => [newAgreement, ...prev]);
      setIsAgreementDialogOpen(false);
      setSelectedFile(null);
      toast({ title: "Agreement Created", description: "Document organized in Cloudinary." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: err.message });
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
      const uploadRes: any = await uploadDoc.mutateAsync({
        file: selectedFile,
        customId: `Receipt_${targetTax.tenderNumber}_${Date.now()}`,
        district: targetTax.district,
        type: 'tax'
      });

      setTaxes(prev => prev.map(t => t.id === payTaxId ? { 
        ...t, status: 'Paid' as TaxStatus, 
        documentUrl: uploadRes.url, 
        paymentDate: new Date().toISOString().split('T')[0] 
      } : t));

      setIsPayDialogOpen(false);
      setPayTaxId(null);
      setSelectedFile(null);
      toast({ title: "Payment Recorded", description: "Receipt saved to cloud." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Receipt Failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- CRUD ACTIONS ---
  const handleRestore = (id: string, _type: CentralBinItem['type']) => {
    setAgreements(prev => prev.map(a => a.id === id ? { ...a, deleted: false } : a));
    setTaxes(prev => prev.map(t => (t.id === id || t.tenderId === id) ? { ...t, deleted: false } : t));
    toast({ title: "Restored" });
  };

  const handlePermanentDelete = (id: string, _type: CentralBinItem['type']) => {
    setAgreements(prev => prev.filter(a => a.id !== id));
    setTaxes(prev => prev.filter(t => t.id !== id && t.tenderId !== id));
    toast({ variant: "destructive", title: "Permanently Deleted" });
  };

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
  };

  // --- FILTERS ---
  const filteredTenders = agreements.filter(a => !a.deleted).filter(t => {
    const matchesSearch = t.district.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.tenderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = districtFilter === "all" ? true : t.district === districtFilter;
    return matchesSearch && matchesDistrict;
  });

  const filteredTaxes = taxes.filter(t => !t.deleted).filter(t => {
    const matchesSearch = t.tenderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTaxStatus = taxStatusFilter !== "All" ? t.status === taxStatusFilter : true;
    return matchesSearch && matchesTaxStatus;
  });

  const allDeletedItems: CentralBinItem[] = [
    ...agreements.filter(a => a.deleted).map(a => ({ 
      id: a.id, type: 'agreement' as any, displayName: a.tenderName, subText: a.district, deletedAt: a.deletedAt || "" 
    })),
    ...taxes.filter(t => t.deleted).map(t => ({ 
      id: t.id, type: 'tax' as any, displayName: `Tax: ${t.tenderNumber}`, subText: t.district, deletedAt: t.deletedAt || "" 
    }))
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Documents & Compliance</h1>
          <p className="text-muted-foreground">Managed via Cloudinary Organized Storage</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setRecycleBinOpen(true)}>
            <ArchiveRestore className="h-4 w-4 mr-2" /> Recycle Bin
          </Button>
          <Button onClick={() => { setEditingAgreement(null); setIsAgreementDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> New Agreement
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="agreements">Agreements</TabsTrigger>
            <TabsTrigger value="taxes">Tax Registry</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
            </div>
            {searchTerm && <Button variant="ghost" size="icon" onClick={() => setSearchTerm("")}><FilterX className="h-4 w-4 text-destructive" /></Button>}
          </div>
        </div>

        <TabsContent value="agreements">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tender Agreement</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenders.map((tender) => (
                  <TableRow key={tender.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span>{tender.tenderNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>{tender.district}</TableCell>
                    <TableCell>{tender.endDate}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="sm" asChild>
                         <a href={tender.documentUrl} target="_blank" rel="noreferrer">
                           <Download className="h-4 w-4 mr-2" /> View
                         </a>
                       </Button>
                       <Button variant="ghost" size="icon" className="text-destructive" onClick={() => initiateDelete('agreement', tender.id)}>
                         <Trash2 className="h-4 w-4" />
                       </Button>
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
              <TableHeader>
                <TableRow>
                  <TableHead>Tender Ref</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTaxes.map((tax) => (
                  <TableRow key={tax.id}>
                    <TableCell className="font-medium">{tax.tenderNumber}</TableCell>
                    <TableCell>₹{tax.amount.toLocaleString()}</TableCell>
                    <TableCell>{getTaxStatusBadge(tax.status)}</TableCell>
                    <TableCell className="text-right">
                       {tax.status !== 'Paid' ? (
                         <Button size="sm" onClick={() => { setPayTaxId(tax.id); setSelectedFile(null); setIsPayDialogOpen(true); }}>
                           Mark Paid
                         </Button>
                       ) : (
                         <Button variant="ghost" size="sm" asChild>
                           <a href={tax.documentUrl || tax.receiptUrl} target="_blank" rel="noreferrer"><Download className="h-4 w-4" /></a>
                         </Button>
                       )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Agreement Dialog */}
      <Dialog open={isAgreementDialogOpen} onOpenChange={setIsAgreementDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>New Tender Agreement</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateAgreement} className="space-y-4">
             <div className="space-y-2"><Label>Tender Name</Label><Input name="tenderName" required /></div>
             <div className="space-y-2"><Label>Tender Number *</Label><Input name="tenderNumber" required /></div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2"><Label>District</Label><Input name="district" required /></div>
               <div className="space-y-2"><Label>Area</Label><Input name="area" required /></div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Start Date</Label><Input name="startDate" type="date" required /></div>
                <div className="space-y-2"><Label>End Date</Label><Input name="endDate" type="date" required /></div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Fee</Label><Input name="fee" type="number" required /></div>
                <div className="space-y-2"><Label>Frequency</Label>
                    <Select name="frequency" defaultValue="Quarterly">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                            <SelectItem value="Quarterly">Quarterly</SelectItem>
                            <SelectItem value="Yearly">Yearly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
             </div>
             <div className="space-y-2">
                <Label>Agreement PDF</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center relative hover:bg-muted/50 transition-colors">
                  <Input 
                    type="file" accept=".pdf" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">{selectedFile ? selectedFile.name : "Select PDF"}</p>
                </div>
             </div>
             <DialogFooter>
               <Button type="submit" disabled={isSubmitting || !selectedFile}>
                 {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Create Agreement"}
               </Button>
             </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Pay Tax Dialog */}
      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
         <DialogContent>
           <DialogHeader><DialogTitle>Upload Payment Receipt</DialogTitle></DialogHeader>
           <form onSubmit={handlePaySubmit} className="space-y-4">
              <div className="space-y-2">
                 <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center relative">
                    <Input 
                      type="file" accept=".pdf" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm">{selectedFile ? selectedFile.name : "Select PDF Receipt"}</p>
                 </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting || !selectedFile}>
                  {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Upload & Mark Paid"}
                </Button>
              </DialogFooter>
           </form>
         </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Item?</AlertDialogTitle><AlertDialogDescription>This item will be moved to the recycle bin.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="bg-destructive">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RecycleBinDialog 
        open={recycleBinOpen} onOpenChange={setRecycleBinOpen}
        deletedItems={allDeletedItems} onRestore={handleRestore} onPermanentDelete={handlePermanentDelete}
      />
    </div>
  );
};

const getTaxStatusBadge = (status: string) => {
  switch (status) {
    case 'Paid': return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
    case 'Pending': return <Badge variant="warning">Pending</Badge>;
    case 'Overdue': return <Badge variant="destructive">Overdue</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

export default Documents;