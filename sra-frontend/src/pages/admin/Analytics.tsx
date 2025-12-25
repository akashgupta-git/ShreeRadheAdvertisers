/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  getChartData, 
  getDistrictStats, 
  mediaTypes, 
  bookings, 
  customers, 
  customerGroups,
  mediaLocations,
  states
} from "@/lib/data";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, AreaChart, Area, Legend, ComposedChart
} from 'recharts';
import { 
  TrendingUp, Award, MapPin, IndianRupee, Users, Zap, Target, 
  Activity, ArrowUpRight, Briefcase, Gem, LayoutDashboard, 
  ShieldCheck, Landmark, BarChart3, TrendingDown,
  Eye, Layers, Globe, AlertTriangle, Clock, Percent, Banknote, Info, ChevronRight, CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const Analytics = () => {
  const { cityData, monthlyData } = getChartData();
  const districtStats = getDistrictStats();
  const [timeRange, setTimeRange] = useState('year');
  
  // State for the interactive Drill-Down
  const [drillDown, setDrillDown] = useState<{
    open: boolean;
    title: string;
    type: 'critical' | 'portfolio' | 'city' | 'type' | 'expiring' | 'cityLoss' | null;
    selectedCity?: string;
  }>({ open: false, title: '', type: null });

  // --- 1. ENHANCED CALCULATIONS ---
  const analyticsData = useMemo(() => {
    const lastThreeMonths = monthlyData.slice(-3);
    const avgGrowth = (lastThreeMonths[2].revenue / lastThreeMonths[0].revenue) - 1;
    const baseRevenue = lastThreeMonths[2].revenue;
    const forecast = [
      ...monthlyData.map(d => ({ ...d, type: 'actual', target: Math.round(d.revenue * 1.15) })),
      { month: 'Jan (F)', revenue: Math.round(baseRevenue * (1 + avgGrowth / 3)), type: 'forecast', target: Math.round(baseRevenue * 1.2) },
      { month: 'Feb (F)', revenue: Math.round(baseRevenue * (1 + avgGrowth / 2)), type: 'forecast', target: Math.round(baseRevenue * 1.25) }
    ];

    const stateRev = states.map(state => {
      const stateMediaIds = mediaLocations.filter(m => m.state === state).map(m => m.id);
      const rev = bookings.filter(b => stateMediaIds.includes(b.mediaId)).reduce((sum, b) => sum + b.amountPaid, 0);
      return { name: state, value: rev };
    }).sort((a, b) => b.value - a.value);

    const available = mediaLocations.filter(m => m.status === 'Available');
    
    // Detailed list for Vacancy logic
    const allVacantSites = mediaLocations
      .filter(m => m.status === 'Available')
      .map(m => ({
        ...m,
        daysVacant: Math.floor(Math.random() * 150) + 15 
      }))
      .sort((a, b) => b.daysVacant - a.daysVacant);

    const aging = [
      { range: '0-30 Days', count: allVacantSites.filter(s => s.daysVacant <= 30).length, fill: '#10b981' },
      { range: '31-60 Days', count: allVacantSites.filter(s => s.daysVacant > 30 && s.daysVacant <= 60).length, fill: '#6366f1' },
      { range: '61-90 Days', count: allVacantSites.filter(s => s.daysVacant > 60 && s.daysVacant <= 90).length, fill: '#f59e0b' },
      { range: '90+ Days', count: allVacantSites.filter(s => s.daysVacant > 90).length, fill: '#ef4444' },
    ];

    const revenueLossByCity = cityData.map(city => {
        const vacant = allVacantSites.filter(m => m.city === city.name);
        const loss = vacant.reduce((sum, m) => sum + m.pricePerMonth, 0);
        return { name: city.name, loss, count: vacant.length };
      }).filter(c => c.loss > 0).sort((a, b) => b.loss - a.loss);

    return { forecast, stateRev, aging, allVacantSites, revenueLossByCity };
  }, [monthlyData, cityData]);

  const bestCity = cityData[0];
  const bestMediaType = mediaTypes.reduce((best, type) => {
    const count = districtStats.reduce((sum, d) => sum + d.byType[type].total, 0);
    return count > (best?.count || 0) ? { type, count } : best;
  }, null as { type: string; count: number } | null);

  const mediaTypePerformance = mediaTypes.map(type => {
    const total = districtStats.reduce((sum, d) => sum + d.byType[type].total, 0);
    const booked = districtStats.reduce((sum, d) => sum + d.byType[type].booked, 0);
    return { type, total, booked, occupancy: total > 0 ? Math.round((booked / total) * 100) : 0 };
  }).filter(m => m.total > 0);

  const radarData = mediaTypePerformance.map(m => ({
    subject: m.type,
    A: m.occupancy,
    fullMark: 100,
  }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // --- 2. DYNAMIC MODAL CONTENT ---
  const renderModalContent = () => {
    if (!drillDown.type) return null;

    // Logic for City Specific Loss Drill-down
    if (drillDown.type === 'cityLoss' || drillDown.type === 'critical') {
      const displayList = drillDown.selectedCity 
        ? analyticsData.allVacantSites.filter(s => s.city === drillDown.selectedCity)
        : analyticsData.allVacantSites;

      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-destructive/5 border-destructive/20 shadow-none">
                <CardContent className="pt-6">
                    <p className="text-xs text-destructive/70 font-bold uppercase mb-1">Monthly Loss</p>
                    <p className="text-2xl font-black text-destructive">
                        ₹{displayList.reduce((sum, s) => sum + s.pricePerMonth, 0).toLocaleString()}
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-muted/50 border-none shadow-none"><CardContent className="pt-6"><p className="text-xs text-muted-foreground font-bold uppercase mb-1">Vacant Units</p><p className="text-2xl font-black">{displayList.length}</p></CardContent></Card>
            <Card className="bg-muted/50 border-none shadow-none">
                <CardContent className="pt-6">
                    <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Avg. Vacancy</p>
                    <p className="text-2xl font-black">
                        {displayList.length > 0 ? Math.round(displayList.reduce((sum, s) => sum + s.daysVacant, 0) / displayList.length) : 0} Days
                    </p>
                </CardContent>
            </Card>
          </div>
          <div className="rounded-xl border border-border bg-card">
            <Table>
              <TableHeader className="bg-muted/50"><TableRow><TableHead>Site ID</TableHead><TableHead>Type</TableHead><TableHead className="text-center">Days Vacant</TableHead><TableHead className="text-right">Price/Mo</TableHead></TableRow></TableHeader>
              <TableBody>
                {displayList.map((site) => (
                  <TableRow key={site.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-bold text-primary">{site.id}</TableCell>
                    <TableCell><div className="font-medium text-sm">{site.type}</div><div className="text-[10px] text-muted-foreground">{site.address}</div></TableCell>
                    <TableCell className="text-center">
                        <Badge className={cn(
                            "font-bold",
                            site.daysVacant > 60 ? "bg-rose-500" : "bg-amber-500"
                        )}>
                            {site.daysVacant} Days
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">₹{site.pricePerMonth.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      );
    }

    if (drillDown.type === 'portfolio') {
      return (
        <div className="space-y-6">
          <div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={analyticsData.stateRev}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" fontSize={12} /><YAxis tickFormatter={(v) => `₹${v/10000000}Cr`} fontSize={12} /><Tooltip /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div>
          <Table>
            <TableHeader><TableRow><TableHead>State</TableHead><TableHead className="text-right">Units</TableHead><TableHead className="text-right">Annual Revenue</TableHead></TableRow></TableHeader>
            <TableBody>
              {analyticsData.stateRev.map(s => (
                <TableRow key={s.name}>
                  <TableCell className="font-bold">{s.name}</TableCell>
                  <TableCell className="text-right font-medium">{mediaLocations.filter(m => m.state === s.name).length}</TableCell>
                  <TableCell className="text-right font-mono text-success font-bold">₹{(s.value/10000000).toFixed(2)} Cr</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    return <div className="py-20 text-center"><Info className="h-10 w-10 text-muted/30 mx-auto mb-4" /><p className="text-muted-foreground italic">Fetching data trace for {drillDown.title}...</p></div>;
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-primary" /> Executive Intelligence Cabinet
          </h1>
          <p className="text-muted-foreground">Interactive business modeling. Click city lists or cards for deep-dive analysis.</p>
        </div>
        <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-xl border border-border/50 shadow-sm">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px] border-none shadow-none bg-transparent focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="year">Fiscal Year 2024</SelectItem>
              <SelectItem value="quarter">Q4 Deep-Dive</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-2 shadow-lg"><BarChart3 className="h-4 w-4" /> Export Audit</Button>
        </div>
      </div>

      {/* --- KPI TILES --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-l-4 border-l-primary shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer group" onClick={() => setDrillDown({ open: true, title: 'Portfolio Value Breakdown', type: 'portfolio' })}>
          <div className="flex justify-between items-start"><p className="text-sm font-medium text-muted-foreground">Portfolio Value</p><Banknote className="h-5 w-5 text-primary group-hover:animate-bounce" /></div>
          <div className="mt-3"><h3 className="text-2xl font-bold">₹14.2 Cr</h3><p className="text-xs font-semibold mt-1 text-success flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +12.4% vs LY</p></div>
        </Card>
        <Card className="p-6 border-l-4 border-l-success shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer group" onClick={() => setDrillDown({ open: true, title: `Market Strength`, type: 'city' })}>
          <div className="flex justify-between items-start"><p className="text-sm font-medium text-muted-foreground">Best Performing City</p><MapPin className="h-5 w-5 text-success group-hover:animate-pulse" /></div>
          <div className="mt-3"><h3 className="text-2xl font-bold">{bestCity?.name}</h3><p className="text-xs font-semibold mt-1 text-success">{bestCity?.count} Active Locations</p></div>
        </Card>
        <Card className="p-6 border-l-4 border-l-amber-500 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer group" onClick={() => setDrillDown({ open: true, title: 'Revenue Leakage Audit', type: 'critical' })}>
          <div className="flex justify-between items-start"><p className="text-sm font-medium text-muted-foreground">Revenue at Risk</p><AlertTriangle className="h-5 w-5 text-amber-500 group-hover:animate-shake" /></div>
          <div className="mt-3"><h3 className="text-2xl font-bold">₹18.4L</h3><p className="text-xs font-semibold mt-1 text-destructive font-mono underline decoration-dotted">Click to view vacancies</p></div>
        </Card>
        <Card className="p-6 border-l-4 border-l-purple-500 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer group" onClick={() => setDrillDown({ open: true, title: `Format Distribution`, type: 'type' })}>
          <div className="flex justify-between items-start"><p className="text-sm font-medium text-muted-foreground">Primary Format</p><Zap className="h-5 w-5 text-purple-500 group-hover:animate-pulse" /></div>
          <div className="mt-3"><h3 className="text-2xl font-bold">{bestMediaType?.type}</h3><p className="text-xs font-semibold mt-1 text-purple-600">{bestMediaType?.count} Total Units</p></div>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid grid-cols-4 w-full lg:w-[600px] mb-8 bg-muted/50 p-1">
          <TabsTrigger value="revenue" className="gap-2 font-bold"><IndianRupee className="h-4 w-4" /> Performance</TabsTrigger>
          <TabsTrigger value="strategy" className="gap-2 font-bold"><Globe className="h-4 w-4" /> Expansion</TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2 font-bold"><Zap className="h-4 w-4" /> Yield</TabsTrigger>
          <TabsTrigger value="clients" className="gap-2 font-bold"><Users className="h-4 w-4" /> Health</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-6">Gap Analysis & Predictive Forecast</h3>
              <div className="h-[350px]"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={analyticsData.forecast}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}L`} /><Tooltip /><Area type="monotone" dataKey="target" fill="hsl(var(--primary)/0.05)" stroke="hsl(var(--primary)/0.2)" strokeDasharray="5 5" name="Target" /><Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={45}>{analyticsData.forecast.map((entry, index) => (<Cell key={index} fill={entry.type === 'forecast' ? '#94a3b8' : '#6366f1'} opacity={entry.type === 'forecast' ? 0.4 : 1} />))}</Bar></ComposedChart></ResponsiveContainer></div>
            </Card>
            
            {/* INTERACTIVE: City Loss Tracker */}
            <Card className="p-6 shadow-sm border-none bg-rose-50/50">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-rose-700"><TrendingDown className="h-5 w-5" /> City Revenue Loss</h3>
              <p className="text-xs text-rose-600/70 mb-6 italic">Click a city to see vacant site aging.</p>
              <div className="space-y-4">
                {analyticsData.revenueLossByCity.slice(0, 5).map(city => (
                  <div 
                    key={city.name} 
                    className="flex justify-between items-center p-3 bg-white rounded-lg border border-rose-100 shadow-sm cursor-pointer hover:border-rose-400 hover:shadow-md transition-all group"
                    onClick={() => setDrillDown({ 
                        open: true, 
                        title: `Vacancy Details: ${city.name}`, 
                        type: 'cityLoss', 
                        selectedCity: city.name 
                    })}
                  >
                    <div>
                        <p className="font-bold text-sm text-rose-900 group-hover:text-rose-600 transition-colors">{city.name}</p>
                        <p className="text-[10px] text-rose-500 font-bold uppercase">{city.count} Vacant Units</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="font-black text-rose-700">₹{(city.loss / 100000).toFixed(1)}L</p>
                        <ChevronRight className="h-4 w-4 text-rose-300" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="strategy" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 border-none shadow-sm bg-emerald-50/50">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-emerald-700"><CheckCircle2 className="h-5 w-5" /> Expansion "To-Do" List</h3>
              <div className="space-y-4">
                {cityData.slice(0, 5).map(city => (
                  <div key={city.name} className="flex justify-between items-center p-4 bg-white rounded-xl border border-emerald-100 shadow-sm">
                    <div><p className="font-bold text-emerald-900">{city.name}</p><p className="text-xs text-emerald-600 font-bold">Occupancy: 100% (High Demand)</p></div>
                    <Badge className="bg-emerald-600">Buy More Sites</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 border-none shadow-sm bg-muted/20">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">Expansion Stability <ArrowUpRight className="h-5 w-5 text-primary" /></h3>
              <div className="grid grid-cols-2 gap-4">
                {cityData.slice(0, 4).map((city) => (
                  <div key={city.name} className="p-5 bg-card rounded-2xl border shadow-sm space-y-3">
                    <div className="flex justify-between items-center"><span className="font-bold">{city.name}</span><Badge variant="outline" className="text-primary">Tier 1</Badge></div>
                    <div className="space-y-1"><Progress value={88} className="h-1" /><p className="text-[10px] text-muted-foreground font-bold">88% Occ.</p></div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 shadow-sm"><h3 className="text-lg font-semibold mb-4">Occupancy Radar by Format</h3><div className="h-[350px]"><ResponsiveContainer width="100%" height="100%"><RadarChart data={radarData}><PolarGrid /><PolarAngleAxis dataKey="subject" fontSize={12} /><PolarRadiusAxis angle={30} domain={[0, 100]} /><Radar name="Occ %" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} /><Tooltip /></RadarChart></ResponsiveContainer></div></Card>
            <Card className="p-6 shadow-sm"><h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Clock className="h-5 w-5 text-amber-500" /> Inventory Aging</h3><div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={analyticsData.aging} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="count">{analyticsData.aging.map((entry, index) => (<Cell key={index} fill={entry.fill} />))}</Pie><Tooltip /><Legend verticalAlign="bottom" iconType="circle" /></PieChart></ResponsiveContainer></div></Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <Card className="lg:col-span-1 p-6 border-none shadow-sm"><h3 className="text-lg font-bold mb-8">Industry CLV</h3><div className="space-y-6">{customerGroups.slice(0, 4).map((group, idx) => (<div key={idx} className="space-y-2"><div className="flex justify-between text-sm"><span className="font-medium text-muted-foreground">{group}</span><span className="font-bold text-purple-700">₹{(Math.random()*5 + 2).toFixed(1)}L Avg</span></div><Progress value={Math.random()*40 + 60} className="h-2 bg-purple-100" /></div>))}</div></Card>
             
             {/* ACTIONABLE CRITICAL SITES CARD */}
             <Card className="lg:col-span-2 border-none shadow-xl bg-destructive text-white cursor-pointer hover:brightness-110 transition-all group overflow-hidden relative" onClick={() => setDrillDown({ open: true, title: 'Critical Vacancy Action List', type: 'critical' })}>
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform"><TrendingDown className="h-32 w-32" /></div>
                <CardHeader><div className="flex justify-between items-center"><CardTitle className="flex items-center gap-2 text-xl tracking-tight"><TrendingDown className="h-6 w-6" /> Critical Sites</CardTitle><Badge className="bg-white/20 text-white border-none">Immediate Action</Badge></div><p className="text-destructive-foreground/80 text-sm">Inventory vacant for over 60 days. Click to view all and assign sales tasks.</p></CardHeader>
                <CardContent><div className="space-y-4">{analyticsData.allVacantSites.slice(0, 3).map((site, i) => (<div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 group-hover:translate-x-2 transition-transform"><div className="flex items-center gap-4"><div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center font-bold">#{i+1}</div><div><p className="font-mono text-sm font-bold">{site.id}</p><p className="text-xs text-white/70">{site.city}</p></div></div><div className="text-right"><p className="text-sm font-bold">{site.daysVacant} Days</p><p className="text-[10px] text-white/60">₹{site.pricePerMonth.toLocaleString()}</p></div></div>))}<Button variant="outline" className="w-full mt-2 bg-white/5 border-white/20 text-white hover:bg-white/20 gap-2">Explore All Critical Sites <ChevronRight className="h-4 w-4" /></Button></div></CardContent>
             </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* --- DRILL DOWN DIALOG --- */}
      <Dialog open={drillDown.open} onOpenChange={(open) => setDrillDown(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-3 rounded-2xl",
                (drillDown.type === 'critical' || drillDown.type === 'cityLoss') ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
              )}>
                {(drillDown.type === 'critical' || drillDown.type === 'cityLoss') ? <TrendingDown className="h-6 w-6" /> : <Activity className="h-6 w-6" />}
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">{drillDown.title}</DialogTitle>
                <DialogDescription>
                  Reviewing detailed telemetry and performance logs.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <Separator className="mt-6" />

          <div className="flex-1 overflow-y-auto p-6">
            {renderModalContent()}
          </div>
          
          <div className="p-6 border-t bg-muted/20 flex justify-between items-center">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest"><ShieldCheck className="h-3 w-3 inline mr-1" /> Secure AI Data Stream</p>
            <Button onClick={() => setDrillDown(prev => ({ ...prev, open: false }))}>Close Cabinet</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Analytics;