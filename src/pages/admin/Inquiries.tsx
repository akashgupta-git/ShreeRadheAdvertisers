/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useContactSubmissions, useMarkAsAttended, useUnmarkAsAttended } from "@/hooks/api/useContacts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  CheckCircle2, Clock, User, MessageSquare, Phone, 
  Search, Eye, Inbox, TrendingUp, RotateCcw, 
  Tag, Copy, ExternalLink, CalendarClock 
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Inquiries() {
  const { data: response, isLoading } = useContactSubmissions();
  const markAsAttended = useMarkAsAttended();
  const unmarkAsAttended = useUnmarkAsAttended();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);

  const allInquiries = response?.data || [];
  
  const filteredInquiries = allInquiries.filter(inq => 
    inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inq.phone.includes(searchTerm) ||
    inq.inquiryId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingInquiries = filteredInquiries.filter(inq => !inq.attended);
  const recentAttended = filteredInquiries
    .filter(inq => inq.attended)
    .sort((a, b) => new Date(b.attendedAt || 0).getTime() - new Date(a.attendedAt || 0).getTime());

  // Helper for word limit (150 words)
  const getDisplayMessage = (text: string, limit: number = 150) => {
    if (!text) return "";
    const words = text.split(/\s+/);
    if (words.length > limit) return words.slice(0, limit).join(" ") + "...";
    return text;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inquiry Management</h1>
          <p className="text-muted-foreground text-sm font-medium italic">Monitor incoming "Get Quote" requests.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search name or ID..." className="pl-8 shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-none shadow-sm ring-1 ring-primary/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Inbox className="h-5 w-5" /></div>
            <div><p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">Total Leads</p><p className="text-2xl font-black">{allInquiries.length}</p></div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-none shadow-sm ring-1 ring-destructive/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-destructive/10 rounded-lg text-destructive animate-pulse"><Clock className="h-5 w-5" /></div>
            <div><p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">Active leads</p><p className="text-2xl font-black text-destructive">{pendingInquiries.length}</p></div>
          </CardContent>
        </Card>
        <Card className="bg-success/5 border-none shadow-sm ring-1 ring-success/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-success/10 rounded-lg text-success"><TrendingUp className="h-5 w-5" /></div>
            <div><p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">Resolution</p><p className="text-2xl font-black">{allInquiries.length > 0 ? Math.round((recentAttended.length / allInquiries.length) * 100) : 0}%</p></div>
          </CardContent>
        </Card>
      </div>

      {/* ACTIVE LEADS TABLE */}
      <Card className="shadow-lg border-t-4 border-t-destructive overflow-hidden">
        <CardHeader className="bg-destructive/5 py-4 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-destructive">
              <Clock className="h-4 w-4" /> Urgent Inquiries
            </CardTitle>
            {pendingInquiries.length > 0 && <Badge variant="destructive" className="animate-bounce">Action Required</Badge>}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40 font-bold uppercase text-[10px]">
              <TableRow>
                <TableHead className="pl-6 w-32">ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Interested In</TableHead>
                <TableHead className="text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell></TableRow>
              ) : pendingInquiries.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">No unattended leads. Great job!</TableCell></TableRow>
              ) : pendingInquiries.map((item) => (
                <TableRow key={item._id} className="group cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => setSelectedInquiry(item)}>
                  <TableCell className="font-mono text-[10px] pl-6 text-muted-foreground">#{item.inquiryId}</TableCell>
                  <TableCell>
                    <div className="font-semibold text-sm">{item.name}</div>
                    <div className="text-[10px] text-muted-foreground">{item.phone}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] bg-primary/5 text-primary border-primary/10">
                      {item.mediaType || 'General'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6 space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-success hover:bg-success/90 text-white h-8" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        markAsAttended.mutate(item._id); 
                      }}
                      disabled={markAsAttended.isPending}
                    >
                      Attend
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* RESOLVED HISTORY GRID */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-muted-foreground flex items-center gap-2 uppercase tracking-widest px-1">
          <CheckCircle2 className="h-4 w-4 text-success" /> Resolved History
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentAttended.length === 0 && <p className="text-xs text-muted-foreground italic col-span-full pl-1">No history yet.</p>}
          {recentAttended.slice(0, 6).map((item) => (
            <Card key={item._id} className="group bg-card border-none shadow-sm transition-all hover:shadow-md hover:ring-1 ring-primary/20 cursor-pointer overflow-hidden" onClick={() => setSelectedInquiry(item)}>
              <CardContent className="p-4 flex justify-between items-start">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[9px] font-mono text-muted-foreground px-1 bg-muted rounded">#{item.inquiryId}</p>
                    <Badge variant="outline" className="text-[8px] h-3 px-1 border-primary/20 leading-none">{item.mediaType || 'General'}</Badge>
                  </div>
                  <p className="font-bold text-sm truncate text-foreground">{item.name}</p>
                  <p className="text-[10px] text-success font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Attended {format(new Date(item.attendedAt!), "MMM d, yyyy")}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  title="Revert to Active" 
                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all active:scale-90" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    unmarkAsAttended.mutate(item._id); 
                  }}
                  disabled={unmarkAsAttended.isPending}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* DETAIL MODAL */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="sm:max-w-[500px] border-t-8 border-t-primary shadow-2xl">
          <DialogHeader className="border-b pb-4">
            <div className="flex justify-between items-center pr-6">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                Inquiry Details 
                <Badge variant="outline" className="font-mono text-[10px] bg-muted">ID: {selectedInquiry?.inquiryId}</Badge>
              </DialogTitle>
            </div>
            <DialogDescription className="font-medium text-muted-foreground italic flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" /> 
              Submitted on {selectedInquiry?.createdAt ? format(new Date(selectedInquiry.createdAt), "PPP p") : "Unknown Date"}
            </DialogDescription>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 relative group">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Client Name</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold flex items-center gap-2"><User className="h-4 w-4 text-primary" /> {selectedInquiry.name}</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(selectedInquiry.name, "Name")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 relative group">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Phone Number</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {selectedInquiry.phone}</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(selectedInquiry.phone, "Phone")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-dashed">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Interested Category</p>
                <div className="flex items-center gap-2 text-sm font-bold text-foreground bg-primary/5 p-2 rounded-md border border-primary/10 w-fit">
                  <Tag className="h-4 w-4 text-primary" /> {selectedInquiry.mediaType || "General Billboard Inquiry"}
                </div>
              </div>

              <div className="space-y-2 p-4 bg-muted/40 rounded-xl border italic shadow-inner relative overflow-hidden group">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1 mb-2">
                  <MessageSquare className="h-3.5 w-3.5" /> Client Message
                </p>
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  "{getDisplayMessage(selectedInquiry.message, 150)}"
                </p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" 
                  onClick={() => copyToClipboard(selectedInquiry.message, "Message")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>

              {selectedInquiry.attended && (
                <div className="text-[10px] bg-success/10 text-success p-2 rounded border border-success/20 flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Processed by Admin on {format(new Date(selectedInquiry.attendedAt), "PPP p")}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
            <Button variant="outline" onClick={() => setSelectedInquiry(null)} className="font-semibold shadow-sm">
              Close
            </Button>
            {selectedInquiry?.attended ? (
              <Button 
                variant="destructive" 
                className="gap-2 font-bold shadow-sm" 
                onClick={() => { unmarkAsAttended.mutate(selectedInquiry._id); setSelectedInquiry(null); }}
                disabled={unmarkAsAttended.isPending}
              >
                <RotateCcw className="h-4 w-4" /> Move to Active
              </Button>
            ) : (
              <Button 
                className="bg-success hover:bg-success/90 font-bold shadow-sm gap-2" 
                onClick={() => { markAsAttended.mutate(selectedInquiry?._id); setSelectedInquiry(null); }}
                disabled={markAsAttended.isPending}
              >
                <CheckCircle2 className="h-4 w-4" /> Mark Attended
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}