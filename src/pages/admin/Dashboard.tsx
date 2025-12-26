import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { StatsCard } from "@/components/admin/StatsCard";
import { DistrictBreakdown } from "@/components/admin/DistrictBreakdown";
import { ExpiringBookings } from "@/components/admin/ExpiringBookings";
import { CreateBookingDialog } from "@/components/admin/CreateBookingDialog";
import { PaymentListDialog } from "@/components/admin/PaymentManagement";
import { Card } from "@/components/ui/card";
import { 
  getDashboardStats, 
  getChartData, 
  recentBookings, 
  getPaymentStats, 
  bookings as initialBookings, 
  Booking,
  getComplianceStats,
  taxRecords
} from "@/lib/data";
import { 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building2, 
  TrendingUp, 
  IndianRupee, 
  AlertCircle, 
  Wallet,
  ShieldAlert,
  FileText
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"; // Added toast import

const Dashboard = () => {
  const navigate = useNavigate(); 
  const stats = getDashboardStats();
  const paymentStats = getPaymentStats();
  const complianceStats = getComplianceStats();
  const { cityData, statusData, monthlyData } = getChartData();
  
  // State for Managing Bookings/Payments
  const [allBookings, setAllBookings] = useState<Booking[]>(initialBookings);
  
  // State for Payment Dialog
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState<'All' | 'Pending' | 'Partially Paid' | 'Paid'>('All');

  // Logic for Taxes Due in 10 Days
  const today = new Date();
  const tenDaysFromNow = new Date();
  tenDaysFromNow.setDate(today.getDate() + 10);

  const upcomingTaxesCount = taxRecords.filter(record => {
    const dueDate = new Date(record.dueDate);
    return record.status === 'Pending' && dueDate <= tenDaysFromNow && dueDate >= today;
  }).length;

  const handleUpdateBooking = (updated: Booking) => {
    setAllBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
    toast.success(`Booking ${updated.id} payment updated`); // Added toast notification
  };

  // Handler to resolve the 'onDeleteBooking' missing prop error
  const handleDeleteBooking = (id: string) => {
    setAllBookings(prev => prev.filter(b => b.id !== id));
    toast.error(`Payment record for ${id} has been removed`); // Added toast notification
  };

  const openPaymentDetails = (filter: 'All' | 'Pending' | 'Partially Paid' | 'Paid') => {
    setPaymentFilter(filter);
    setIsPaymentOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your advertising platform overview.</p>
        </div>
        <CreateBookingDialog />
      </div>

      {/* --- Compliance Alerts Row --- */}
      <h2 className="text-sm font-semibold text-destructive uppercase tracking-wider flex items-center gap-2">
        <ShieldAlert className="h-4 w-4" /> Compliance Alerts
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard 
          title="Agreements Expiring (30 Days)" 
          value={complianceStats.expiringTenders} 
          icon={FileText}
          variant="danger"
          onClick={() => navigate('/admin/documents?tab=agreements&status=Expiring Soon')}
          className="cursor-pointer hover:shadow-md transition-all border-red-100"
        />
        <StatsCard 
          title="Taxes Due (10 Days)" 
          value={upcomingTaxesCount} 
          icon={Clock}
          variant="warning"
          onClick={() => navigate('/admin/documents?tab=taxes&taxStatus=Pending')}
          className="cursor-pointer hover:shadow-md transition-all border-amber-100"
        />
        <StatsCard 
          title="Overdue Taxes" 
          value={complianceStats.overdueTaxes} 
          icon={AlertCircle}
          variant="danger"
          onClick={() => navigate('/admin/documents?tab=taxes&taxStatus=Overdue')}
          className="cursor-pointer hover:shadow-md transition-all border-red-200"
        />
      </div>

      {/* --- Media Stats Row --- */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pt-2">Inventory Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard 
          title="Total Media" 
          value={stats.total} 
          icon={MapPin}
          variant="primary"
          onClick={() => navigate('/admin/media')}
          className="cursor-pointer hover:shadow-md transition-all"
        />
        <StatsCard 
          title="Available" 
          value={stats.available} 
          icon={CheckCircle}
          variant="success"
          onClick={() => navigate('/admin/media?status=Available')}
          className="cursor-pointer hover:shadow-md transition-all"
        />
        <StatsCard 
          title="Booked" 
          value={stats.booked} 
          icon={XCircle}
          variant="danger"
          onClick={() => navigate('/admin/media?status=Booked')}
          className="cursor-pointer hover:shadow-md transition-all"
        />
        <StatsCard 
          title="Coming Soon" 
          value={stats.comingSoon} 
          icon={Clock}
          variant="warning"
          onClick={() => navigate('/admin/media?status=Coming Soon')}
          className="cursor-pointer hover:shadow-md transition-all"
        />
        <StatsCard title="States" value={stats.statesCount} icon={Building2} variant="default" onClick={() => navigate('/admin/media')} className="cursor-pointer hover:shadow-md transition-all" />
        <StatsCard title="Districts" value={stats.districtsCount} icon={TrendingUp} variant="default" onClick={() => navigate('/admin/media')} className="cursor-pointer hover:shadow-md transition-all" />
      </div>

      {/* --- Financial Insights Row --- */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pt-4">Financial Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard 
          title="Total Revenue Collected" 
          value={`₹${(paymentStats.totalRevenue / 100000).toFixed(1)} L`}
          icon={Wallet}
          variant="success"
          onClick={() => openPaymentDetails('Paid')}
          className="cursor-pointer hover:shadow-md transition-all"
        />
        <StatsCard 
          title="Pending Dues" 
          value={`₹${(paymentStats.pendingDues / 100000).toFixed(1)} L`}
          icon={AlertCircle}
          variant="danger"
          className="border-red-200 dark:border-red-900/50 cursor-pointer hover:shadow-md transition-all"
          onClick={() => openPaymentDetails('Pending')}
        />
        <StatsCard 
          title="Partially Paid Bookings" 
          value={paymentStats.partialCount} 
          icon={IndianRupee}
          variant="warning"
          onClick={() => openPaymentDetails('Partially Paid')}
          className="cursor-pointer hover:shadow-md transition-all"
        />
      </div>

      <ExpiringBookings />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 bg-card border-border/50">
          <h3 className="text-lg font-semibold mb-4">Media by City</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]} 
                  className="cursor-pointer"
                  onClick={(data) => navigate(`/admin/media?city=${data.name}`)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border/50">
          <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  className="cursor-pointer"
                  onClick={(data) => navigate(`/admin/media?status=${data.name}`)}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-card border-border/50">
        <h3 className="text-lg font-semibold mb-4">Booking Trends (2024)</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="hsl(var(--success))" strokeWidth={2} dot={{ fill: 'hsl(var(--success))' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <DistrictBreakdown />

      <Card className="p-6 bg-card border-border/50">
        <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Booking ID</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Media ID</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Client</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr 
                  key={booking.id} 
                  className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => navigate(`/admin/media/${booking.mediaId}`)}
                >
                  <td className="py-3 px-4 font-mono">{booking.id}</td>
                  <td className="py-3 px-4"><Badge variant="secondary">{booking.mediaId}</Badge></td>
                  <td className="py-3 px-4">{booking.client}</td>
                  <td className="py-3 px-4"><span className="text-muted-foreground">Completed</span></td>
                  <td className="py-3 px-4 text-right font-medium">₹{booking.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payment Details Dialog updated with handlers */}
      <PaymentListDialog 
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        bookings={allBookings}
        initialFilter={paymentFilter}
        onUpdateBooking={handleUpdateBooking}
        onDeleteBooking={handleDeleteBooking}
      />
    </div>
  );
};

export default Dashboard;