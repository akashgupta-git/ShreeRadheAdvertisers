/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContactSubmissions } from "@/hooks/api/useContacts";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Inquiries() {
  const { data: response, isLoading } = useContactSubmissions();
  const inquiries = response?.data || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Customer Inquiries</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6}>Loading inquiries...</TableCell></TableRow>
              ) : inquiries.length === 0 ? (
                <TableRow><TableCell colSpan={6}>No inquiries found.</TableCell></TableRow>
              ) : (
                inquiries.map((item: any) => (
                  <TableRow key={item._id}>
                    <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">{item.email}</div>
                      <div className="text-xs text-muted-foreground">{item.phone}</div>
                    </TableCell>
                    <TableCell>{item.mediaType}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'New' ? 'destructive' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{item.message}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}