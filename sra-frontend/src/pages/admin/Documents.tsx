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
  ArchiveRestore
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { tenders as initialTenders, taxRecords as initialTaxes } from "@/lib/data";
import { TenderAgreement, TaxStatus, TenderStatus, TaxRecord, TaxFrequency, ComplianceStats, CentralBinItem } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { RecycleBinDialog } from "@/components/admin/RecycleBinDialog";
import { toast } from "@/hooks/use-toast";

const Documents = () => {
  // --- STATE MANAGEMENT ---
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

  // --- DIALOG STATE ---
  const [isAgreementDialogOpen, setIsAgreementDialogOpen] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState<TenderAgreement | null>(null);
  const [isTaxDialogOpen, setIsTaxDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxRecord | null>(null);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [payTaxId, setPayTaxId] = useState<string | null>(null);
  const [recycleBinOpen, setRecycleBinOpen] = useState(false);

  // --- DELETE CONFIRMATION STATE ---
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'agreement' | 'tax', id: string } | null>(null);

  // --- EFFECT: RECALCULATE STATS ON CHANGE ---
  useEffect(() => {
    const today = new Date();
    const activeAgreements = agreements.filter(a => !a.deleted);
    const activeTaxes = taxes.filter(t => !t.deleted);

    const expiring = activeAgreements.filter(t => {
      if (t.status === 'Expired') return false;
      const diff = new Date(t.endDate).getTime() - today.getTime();
      const days = Math.ceil(diff / (1000 * 3600 * 24));
      return days >= 0 && days <= 30;
    }).length;

    const pending = activeTaxes.filter(t => t.status === 'Pending').length;
    const overdue = activeTaxes.filter(t => t.status === 'Overdue').length;
    const liability = activeTaxes.filter(t => t.status !== 'Paid').reduce((acc, t) => acc + t.amount, 0);
    const paid = activeTaxes.filter(t => t.status === 'Paid').reduce((acc, t) => acc + t.amount, 0);

    setStats({
      expiringTenders: expiring,
      pendingTaxes: pending,
      overdueTaxes: overdue,
      totalActiveTenders: activeAgreements.filter(t => t.status === 'Active').length,
      totalTaxLiability: liability,
      totalTaxPaid: paid
    });
  }, [agreements, taxes]);

  // --- HELPER: AUTOMATIC TAX SCHEDULE GENERATOR ---
  const generateTaxSchedule = (agreement: TenderAgreement): TaxRecord[] => {
    const newTaxes: TaxRecord[] = [];
    const currentDate = new Date(agreement.startDate);
    const endDate = new Date(agreement.endDate);
    const today = new Date();
    
    let intervalMonths = 12;
    if (agreement.taxFrequency === 'Quarterly') intervalMonths = 3;
    if (agreement.taxFrequency === 'Half-Yearly') intervalMonths = 6;
    if (agreement.taxFrequency === 'Monthly') intervalMonths = 1;

    if (agreement.taxFrequency === 'One-Time') {
       newTaxes.push({
          id: `TX-${agreement.id}-001`,
          tenderId: agreement.id,
          tenderNumber: agreement.tenderNumber,
          district: agreement.district,
          area: agreement.area,
          agreementStatus: agreement.status,
          dueDate: agreement.startDate,
          amount: agreement.licenseFee,
          status: new Date(agreement.startDate) < today ? 'Overdue' : 'Pending'
       });
       return newTaxes;
    }

    let periodAmount = agreement.licenseFee;
    if (agreement.taxFrequency === 'Monthly') periodAmount = Math.floor(agreement.licenseFee / 12);
    else if (agreement.taxFrequency === 'Quarterly') periodAmount = Math.floor(agreement.licenseFee / 4);
    else if (agreement.taxFrequency === 'Half-Yearly') periodAmount = Math.floor(agreement.licenseFee / 2);

    let count = 1;
    while (currentDate < endDate) {
      const dueDateStr = currentDate.toISOString().split('T')[0];
      newTaxes.push({
        id: `TX-${agreement.id}-${String(count).padStart(3, '0')}`,
        tenderId: agreement.id,
        tenderNumber: agreement.tenderNumber,
        district: agreement.district,
        area: agreement.area,
        agreementStatus: agreement.status,
        dueDate: dueDateStr,
        amount: periodAmount,
        status: new Date(dueDateStr) < today ? 'Overdue' : 'Pending',
      });
      currentDate.setMonth(currentDate.getMonth() + intervalMonths);
      count++;
    }
    return newTaxes;
  };

  // --- CRUD HANDLERS ---
  const handleCreateAgreement = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const newAgreement: TenderAgreement = {
      id: `TND-${Date.now()}`,
      tenderName: formData.get('tenderName') as string,
      tenderNumber: formData.get('tenderNumber') as string,
      district: formData.get('district') as string,
      area: formData.get('area') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      taxFrequency: formData.get('frequency') as TaxFrequency,
      licenseFee: Number(formData.get('fee')),
      status: 'Active',
      mediaIds: [],
      documentUrl: '#'
    };
    
    setAgreements(prev => [newAgreement, ...prev]);
    const newTaxes = generateTaxSchedule(newAgreement);
    setTaxes(prev => [...newTaxes, ...prev]);
    setIsAgreementDialogOpen(false);
    toast({ title: "Created", description: "Agreement and tax schedule generated." });
  };

  const handleUpdateAgreement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgreement) return;
    const formData = new FormData(e.target as HTMLFormElement);
    
    const updatedAgreement: TenderAgreement = {
      ...editingAgreement,
      tenderName: formData.get('tenderName') as string,
      tenderNumber: formData.get('tenderNumber') as string,
      district: formData.get('district') as string,
      area: formData.get('area') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      taxFrequency: formData.get('frequency') as TaxFrequency,
      status: formData.get('status') as TenderStatus,
      licenseFee: Number(formData.get('fee'))
    };

    setAgreements(prev => prev.map(a => a.id === updatedAgreement.id ? updatedAgreement : a));
    
    const paidTaxes = taxes.filter(t => t.tenderId === updatedAgreement.id && t.status === 'Paid');
    const otherTaxes = taxes.filter(t => t.tenderId !== updatedAgreement.id);
    const potentialNewTaxes = generateTaxSchedule(updatedAgreement);
    
    let filteredNewTaxes = potentialNewTaxes;
    if (paidTaxes.length > 0) {
      const lastPaidDate = paidTaxes.reduce((max, t) => new Date(t.dueDate) > new Date(max) ? t.dueDate : max, paidTaxes[0].dueDate);
      filteredNewTaxes = potentialNewTaxes.filter(t => new Date(t.dueDate) > new Date(lastPaidDate));
    }
    
    setTaxes([
      ...otherTaxes, 
      ...paidTaxes.map(t => ({...t, tenderNumber: updatedAgreement.tenderNumber, district: updatedAgreement.district, area: updatedAgreement.area})), 
      ...filteredNewTaxes
    ]);
    
    setEditingAgreement(null);
    setIsAgreementDialogOpen(false);
    toast({ title: "Updated", description: "Agreement changes saved." });
  };

  const initiateDelete = (type: 'agreement' | 'tax', id: string) => {
    setItemToDelete({ type, id });
    setDeleteAlertOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    const deletedAt = new Date().toISOString();

    if (itemToDelete.type === 'agreement') {
      setAgreements(prev => prev.map(a => a.id === itemToDelete.id ? { ...a, deleted: true, deletedAt } : a));
      setTaxes(prev => prev.map(t => t.tenderId === itemToDelete.id ? { ...t, deleted: true, deletedAt } : t));
    } else {
      setTaxes(prev => prev.map(t => t.id === itemToDelete.id ? { ...t, deleted: true, deletedAt } : t));
    }
    setDeleteAlertOpen(false);
    setItemToDelete(null);
    toast({ title: "Moved to Recycle Bin" });
  };

  const handleRestore = (id: string, type: CentralBinItem['type']) => {
    const isAgreement = agreements.some(a => a.id === id);
    if (isAgreement || type === 'media') {
      setAgreements(prev => prev.map(a => a.id === id ? { ...a, deleted: false, deletedAt: undefined } : a));
      setTaxes(prev => prev.map(t => t.tenderId === id ? { ...t, deleted: false, deletedAt: undefined } : t));
    } else {
      setTaxes(prev => prev.map(t => t.id === id ? { ...t, deleted: false, deletedAt: undefined } : t));
    }
    toast({ title: "Restored" });
  };

  const handlePermanentDelete = (id: string, type: CentralBinItem['type']) => {
    const isAgreement = agreements.some(a => a.id === id);
    if (isAgreement || type === 'media') {
      setAgreements(prev => prev.filter(a => a.id !== id));
      setTaxes(prev => prev.filter(t => t.tenderId !== id));
    } else {
      setTaxes(prev => prev.filter(t => t.id !== id));
    }
    toast({ variant: "destructive", title: "Permanently Deleted" });
  };

  const handleUpdateTax = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTax) return;
    const formData = new FormData(e.target as HTMLFormElement);
    const updatedTax: TaxRecord = {
      ...editingTax,
      amount: Number(formData.get('amount')),
      dueDate: formData.get('dueDate') as string,
      status: formData.get('status') as TaxStatus
    };
    setTaxes(prev => prev.map(t => t.id === updatedTax.id ? updatedTax : t));
    setEditingTax(null);
    setIsTaxDialogOpen(false);
    toast({ title: "Tax record updated" });
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payTaxId) return;
    setTaxes(prev => prev.map(t => t.id === payTaxId ? { ...t, status: 'Paid', paymentDate: new Date().toISOString().split('T')[0] } : t));
    setIsPayDialogOpen(false);
    setPayTaxId(null);
    toast({ title: "Payment Recorded" });
  };

  const handleExpiringAlertClick = () => { setActiveTab("agreements"); setGeneralStatusFilter("Expiring Soon"); setSearchTerm(""); };
  const handleTaxAlertClick = () => { setActiveTab("taxes"); setTaxStatusFilter("Pending"); setAgreementStatusFilter("All"); setSearchTerm(""); };
  const handleActiveAgreementsClick = () => { setActiveTab("agreements"); setGeneralStatusFilter("Active"); setSearchTerm(""); };
  const handlePendingLiabilityClick = () => { setActiveTab("taxes"); setTaxStatusFilter("Pending"); setAgreementStatusFilter("Active"); setSearchTerm(""); };
  const handleTotalPaidClick = () => { setActiveTab("taxes"); setTaxStatusFilter("Paid"); setAgreementStatusFilter("All"); setSearchTerm(""); };
  const clearFilters = () => { setSearchTerm(""); setGeneralStatusFilter(null); setTaxStatusFilter("All"); setAgreementStatusFilter("All"); };
  
  const handleDownload = (e: React.MouseEvent, fileName: string) => { 
    e.stopPropagation(); 
    alert(`Downloading: ${fileName}`); 
  };

  const filteredTenders = agreements.filter(a => !a.deleted).filter(t => {
    const matchesSearch = t.district.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.area.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.tenderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.tenderName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = generalStatusFilter ? t.status === generalStatusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const filteredTaxes = taxes.filter(t => !t.deleted).filter(t => {
    const matchesSearch = t.tenderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTaxStatus = taxStatusFilter !== "All" ? t.status === taxStatusFilter : true;
    const matchesAgreementStatus = agreementStatusFilter !== "All" ? t.agreementStatus === agreementStatusFilter : true;
    return matchesSearch && matchesTaxStatus && matchesAgreementStatus;
  });

  // Correctly mapping deleted items to CentralBinItem interface
  const allDeletedItems: CentralBinItem[] = [
    ...agreements.filter(a => a.deleted).map(a => ({ 
      id: a.id, 
      type: 'media' as const, 
      displayName: a.tenderName || "Untitled Agreement", 
      subText: `${a.district}, ${a.area}`, 
      deletedAt: a.deletedAt || new Date().toISOString() 
    })),
    ...taxes.filter(t => t.deleted).map(t => ({ 
      id: t.id, 
      type: 'payment' as const, 
      displayName: `Tax Record: ${t.tenderNumber}`, 
      subText: `${t.district} (${t.dueDate})`, 
      deletedAt: t.deletedAt || new Date().toISOString() 
    }))
  ];

  const generateDocName = (type: string, district: string, area: string) => {
    return `${type}_${district}_${area.replace(/\s+/g, '')}_2024.pdf`;
  };

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
          <Button variant="outline" className="relative" onClick={() => setRecycleBinOpen(true)}>
            <ArchiveRestore className="h-4 w-4 mr-2" />
            Recycle Bin
            {allDeletedItems.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                {allDeletedItems.length}
              </span>
            )}
          </Button>
          <Button onClick={() => { setEditingAgreement(null); setIsAgreementDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            New Agreement
          </Button>
        </div>
      </div>

      {/* --- ALERTS SECTION --- */}
      {(stats.expiringTenders > 0 || stats.pendingTaxes > 0 || stats.overdueTaxes > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.expiringTenders > 0 && (
            <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900 cursor-pointer hover:bg-red-100 transition-colors" onClick={handleExpiringAlertClick}>
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertTitle className="text-red-700 dark:text-red-400 font-semibold flex items-center gap-2">
                Action Required: Tenders Expiring
                <Badge variant="destructive" className="ml-auto">View List</Badge>
              </AlertTitle>
              <AlertDescription className="text-red-600 dark:text-red-300">
                {stats.expiringTenders} agreement(s) are expiring within the next 30 days.
              </AlertDescription>
            </Alert>
          )}
          {(stats.pendingTaxes > 0 || stats.overdueTaxes > 0) && (
            <Alert className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900 cursor-pointer hover:bg-orange-100 transition-colors" onClick={handleTaxAlertClick}>
              <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <AlertTitle className="text-orange-700 dark:text-orange-400 font-semibold flex items-center gap-2">
                Tax Liability Alert
                <Badge variant="outline" className="ml-auto border-orange-500 text-orange-700">View Registry</Badge>
              </AlertTitle>
              <AlertDescription className="text-orange-600 dark:text-orange-300">
                {stats.overdueTaxes} overdue and {stats.pendingTaxes} pending tax payments require attention.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-primary/50" onClick={handleActiveAgreementsClick}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agreements</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActiveTenders}</div>
            <p className="text-xs text-muted-foreground mt-1">Click to view all</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:border-orange-500/50" onClick={handlePendingLiabilityClick}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liability</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalTaxLiability.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending + Overdue</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-green-500/50" onClick={handleTotalPaidClick}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tax Paid</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(stats.totalTaxPaid.toLocaleString('en-IN'))}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime collected</p>
          </CardContent>
        </Card>

        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">System Status</CardTitle>
             <Clock className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-green-600">Healthy</div>
             <p className="text-xs text-muted-foreground mt-1">Auto-schedule active</p>
           </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="agreements">Agreements</TabsTrigger>
            <TabsTrigger value="taxes">Tax Registry</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search district, ref #, name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
            </div>
            {(generalStatusFilter || taxStatusFilter !== "All" || searchTerm) && (
              <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear Filters">
                <FilterX className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="agreements">
          <Card>
            <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2">
                All Agreements
                {generalStatusFilter && <Badge variant="secondary">{generalStatusFilter}</Badge>}
              </h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agreement Name</TableHead>
                  <TableHead>Ref Number</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenders.map((tender) => (
                  <TableRow key={tender.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-primary hover:underline cursor-pointer font-medium" onClick={() => { setEditingAgreement(tender); setIsAgreementDialogOpen(true); }}>
                          {tender.tenderName || generateDocName('Agreement', tender.district, tender.area)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">{tender.tenderNumber}</TableCell>
                    <TableCell>{tender.district}, {tender.area}</TableCell>
                    <TableCell className={cn(Math.ceil((new Date(tender.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) <= 30 && "text-red-600 font-bold")}>
                      {tender.endDate}
                    </TableCell>
                    <TableCell><Badge variant={tender.status === 'Active' ? 'success' : 'destructive'}>{tender.status}</Badge></TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2">
                         <Button variant="outline" size="sm" className="gap-2" onClick={(e) => handleDownload(e, `${tender.tenderNumber}.pdf`)}>
                            <Download className="h-3 w-3" /> Download
                         </Button>
                         <Button variant="ghost" size="icon" onClick={() => { setEditingAgreement(tender); setIsAgreementDialogOpen(true); }}>
                           <Pencil className="h-4 w-4 text-muted-foreground" />
                         </Button>
                         <Button variant="ghost" size="icon" className="text-destructive" onClick={() => initiateDelete('agreement', tender.id)}>
                           <Trash2 className="h-4 w-4" />
                         </Button>
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
            <div className="p-4 border-b bg-muted/30 flex flex-wrap gap-4 items-center">
              <Select value={taxStatusFilter} onValueChange={(v: any) => setTaxStatusFilter(v)}>
                <SelectTrigger className="h-8 w-[130px]"><SelectValue placeholder="Tax Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              <Select value={agreementStatusFilter} onValueChange={(v: any) => setAgreementStatusFilter(v)}>
                <SelectTrigger className="h-8 w-[140px]"><SelectValue placeholder="Agreement" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Agreements</SelectItem>
                  <SelectItem value="Active">Active Only</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt Name / Ref</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Tax Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTaxes.map((tax) => {
                  const receiptName = tax.status === 'Paid' 
                    ? `Receipt_${tax.district}_${tax.area}_${tax.dueDate}.pdf`
                    : `Invoice_${tax.district}_${tax.area}_Due_${tax.dueDate}.pdf`;

                  return (
                    <TableRow key={tax.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {tax.status === 'Paid' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                          <span className="truncate max-w-[200px]" title={receiptName}>{tax.tenderNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>{tax.district} - {tax.area}</TableCell>
                      <TableCell>₹{tax.amount.toLocaleString()}</TableCell>
                      <TableCell className={cn(tax.status === 'Overdue' && "text-red-600 font-bold")}>{tax.dueDate}</TableCell>
                      <TableCell>{getTaxStatusBadge(tax.status)}</TableCell>
                      <TableCell className="text-right">
                         <div className="flex justify-end gap-2">
                           <Button variant="ghost" size="icon" onClick={(e) => handleDownload(e, receiptName)} title="Download Receipt/Invoice">
                             <Download className="h-4 w-4" />
                           </Button>
                           <DropdownMenu>
                             <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                             <DropdownMenuContent align="end">
                               {tax.status !== 'Paid' && <DropdownMenuItem onClick={() => { setPayTaxId(tax.id); setIsPayDialogOpen(true); }}>Mark as Paid</DropdownMenuItem>}
                               <DropdownMenuItem onClick={() => { setEditingTax(tax); setIsTaxDialogOpen(true); }}>Edit Record</DropdownMenuItem>
                               <DropdownMenuItem className="text-destructive" onClick={() => initiateDelete('tax', tax.id)}>Delete Record</DropdownMenuItem>
                             </DropdownMenuContent>
                           </DropdownMenu>
                         </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- DIALOGS --- */}
      <Dialog open={isAgreementDialogOpen} onOpenChange={setIsAgreementDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{editingAgreement ? 'Edit Tender Agreement' : 'New Tender Agreement'}</DialogTitle></DialogHeader>
          <form onSubmit={editingAgreement ? handleUpdateAgreement : handleCreateAgreement} className="space-y-4 py-4">
             {/* TENDER NAME INPUT */}
             <div className="space-y-2">
               <Label>Tender / Agreement Name</Label>
               <Input 
                 name="tenderName" 
                 placeholder="e.g., PMC Hoarding Rights 2024" 
                 defaultValue={editingAgreement?.tenderName} 
                 required 
               />
             </div>

             {/* TENDER REFERENCE NUMBER */}
             <div className="space-y-2">
               <Label>Reference Number</Label>
               <Input 
                 name="tenderNumber" 
                 placeholder="e.g., TN/MUM/2024/08" 
                 defaultValue={editingAgreement?.tenderNumber} 
                 required 
               />
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2"><Label>District</Label><Input name="district" defaultValue={editingAgreement?.district} required /></div>
               <div className="space-y-2"><Label>Area</Label><Input name="area" defaultValue={editingAgreement?.area} required /></div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2"><Label>Start Date</Label><Input name="startDate" type="date" defaultValue={editingAgreement?.startDate} required /></div>
               <div className="space-y-2"><Label>End Date</Label><Input name="endDate" type="date" defaultValue={editingAgreement?.endDate} required /></div>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2"><Label>Annual / Total Fee</Label><Input name="fee" type="number" defaultValue={editingAgreement?.licenseFee} required /></div>
               <div className="space-y-2">
                 <Label>Tax Frequency</Label>
                 <Select name="frequency" defaultValue={editingAgreement?.taxFrequency || 'Quarterly'}>
                   <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="Monthly">Monthly</SelectItem>
                     <SelectItem value="Quarterly">Quarterly</SelectItem>
                     <SelectItem value="Half-Yearly">Half-Yearly</SelectItem>
                     <SelectItem value="Yearly">Yearly</SelectItem>
                     <SelectItem value="One-Time">One-Time</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             </div>
             
             {editingAgreement && (
               <div className="space-y-2">
                 <Label>Status</Label>
                 <Select name="status" defaultValue={editingAgreement.status}>
                   <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="Active">Active</SelectItem>
                     <SelectItem value="Expired">Expired</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             )}
             
             <div className="space-y-2">
                <Label>Agreement PDF</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload file</p>
                </div>
             </div>
             <DialogFooter><Button type="submit">{editingAgreement ? 'Save Changes' : 'Create Agreement'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isTaxDialogOpen} onOpenChange={setIsTaxDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Tax Record</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdateTax} className="space-y-4 py-4">
             <div className="space-y-2"><Label>Amount</Label><Input name="amount" type="number" defaultValue={editingTax?.amount} /></div>
             <div className="space-y-2"><Label>Due Date</Label><Input name="dueDate" type="date" defaultValue={editingTax?.dueDate} /></div>
             <div className="space-y-2">
               <Label>Status</Label>
               <Select name="status" defaultValue={editingTax?.status}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
               </Select>
             </div>
             <DialogFooter><Button type="submit">Update Record</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Recycle Bin?</AlertDialogTitle>
            <AlertDialogDescription>Items are kept for 30 days before permanent deletion.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Move to Bin</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
         <DialogContent>
           <DialogHeader><DialogTitle>Mark as Paid</DialogTitle></DialogHeader>
           <form onSubmit={handlePaySubmit} className="space-y-4">
              <div className="space-y-2">
                 <Label>Upload Receipt</Label>
                 <div className="border-2 border-dashed border-input rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload receipt</p>
                    <Input type="file" className="hidden" />
                 </div>
              </div>
              <DialogFooter><Button type="submit">Confirm Payment</Button></DialogFooter>
           </form>
         </DialogContent>
      </Dialog>

      <RecycleBinDialog 
        open={recycleBinOpen} 
        onOpenChange={setRecycleBinOpen}
        deletedItems={allDeletedItems}
        onRestore={handleRestore}
        onPermanentDelete={handlePermanentDelete}
      />
    </div>
  );
};

export default Documents;