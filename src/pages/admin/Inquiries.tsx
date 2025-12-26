import { useContactSubmissions, useMarkAsAttended } from "@/hooks/api/useContacts";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock } from "lucide-react";

export default function Inquiries() {
  const { data: response, isLoading } = useContactSubmissions();
  const markAsAttended = useMarkAsAttended();
  
  const allInquiries = response?.data || [];
  
  // Separate the lists
  const pendingInquiries = allInquiries.filter(inq => !inq.attended);
  const recentAttended = allInquiries
    .filter(inq => inq.attended)
    .sort((a, b) => new Date(b.attendedAt || 0).getTime() - new Date(a.attendedAt || 0).getTime())
    .slice(0, 10); // Show only last 10

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Inquiry Management</h1>

      {/* NEW INQUIRIES SECTION */}
      <Card className="border-destructive shadow-md"> 
  <CardHeader className="bg-destructive/5">
    <CardTitle className="flex items-center gap-2">
      <Clock className="h-5 w-5 text-destructive" />
      New Leads (Unattended)
    </CardTitle>
  </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>
              ) : pendingInquiries.length === 0 ? (
                <TableRow><TableCell colSpan={5}>No new leads.</TableCell></TableRow>
              ) : (
                pendingInquiries.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-mono text-xs">{item.inquiryId}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.phone}</TableCell>
                    <TableCell className="max-w-xs truncate">{item.message}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => markAsAttended.mutate(item._id)}
                        disabled={markAsAttended.isPending}
                      >
                        Mark Attended
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* RECENT ATTENDED SECTION */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Recent History (Last 10)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Attended Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentAttended.map((item) => (
                <TableRow key={item._id} className="opacity-70">
                  <TableCell className="font-mono text-xs">{item.inquiryId}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{new Date(item.attendedAt!).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Attended</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}