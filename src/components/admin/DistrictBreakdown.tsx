import { useState, Fragment } from "react";
import { getDistrictStats, mediaTypes, states } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function DistrictBreakdown() {
  const [selectedState, setSelectedState] = useState<string>('all');
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);
  const districtStats = getDistrictStats();

  const filteredStats = selectedState === 'all' 
    ? districtStats 
    : districtStats.filter(d => d.state === selectedState);

  return (
    <Card className="p-6 bg-card border-border/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">District-wise Media Breakdown</h3>
        <Select value={selectedState} onValueChange={setSelectedState}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {states.map(state => (
              <SelectItem key={state} value={state}>{state}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-8"></TableHead>
              <TableHead>District</TableHead>
              <TableHead>State</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Available</TableHead>
              <TableHead className="text-center">Booked</TableHead>
              <TableHead className="text-center">Coming Soon</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStats.map((stat) => (
              <Fragment key={`${stat.state}-${stat.district}`}>
                <TableRow 
                  className={cn(
                    "cursor-pointer hover:bg-muted/30 transition-colors",
                    expandedDistrict === `${stat.state}-${stat.district}` && "bg-muted/30"
                  )}
                  onClick={() => setExpandedDistrict(
                    expandedDistrict === `${stat.state}-${stat.district}` 
                      ? null 
                      : `${stat.state}-${stat.district}`
                  )}
                >
                  <TableCell>
                    {expandedDistrict === `${stat.state}-${stat.district}` 
                      ? <ChevronDown className="h-4 w-4" />
                      : <ChevronRight className="h-4 w-4" />
                    }
                  </TableCell>
                  <TableCell className="font-medium">{stat.district}</TableCell>
                  <TableCell className="text-muted-foreground">{stat.state}</TableCell>
                  <TableCell className="text-center font-semibold">{stat.totalMedia}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="success">{stat.available}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="destructive">{stat.booked}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="warning">{stat.comingSoon}</Badge>
                  </TableCell>
                </TableRow>
                
                {expandedDistrict === `${stat.state}-${stat.district}` && (
                  <TableRow>
                    <TableCell colSpan={7} className="bg-muted/20 p-0">
                      <div className="p-4">
                        <h4 className="text-sm font-medium mb-3">Media Type Breakdown</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                          {mediaTypes.map(type => {
                            const typeStats = stat.byType[type];
                            if (typeStats.total === 0) return null;
                            return (
                              <div key={type} className="p-3 rounded-lg bg-background border border-border">
                                <div className="text-sm font-medium mb-2">{type}</div>
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total:</span>
                                    <span className="font-medium">{typeStats.total}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-success">Available:</span>
                                    <span>{typeStats.available}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-destructive">Booked:</span>
                                    <span>{typeStats.booked}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-warning">Soon:</span>
                                    <span>{typeStats.comingSoon}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}