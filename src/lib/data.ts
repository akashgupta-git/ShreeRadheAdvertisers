/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { 
  TenderAgreement, 
  TaxRecord, 
  ComplianceStats, 
} from './api/types';

export type MediaType = 'Unipole' | 'Hoarding' | 'Gantry' | 'Kiosk' | 'Digital LED';
export type MediaStatus = 'Available' | 'Booked' | 'Coming Soon';
export type PaymentStatus = 'Paid' | 'Pending' | 'Partially Paid';
export type PaymentMode = 'Cash' | 'Cheque' | 'Online' | 'Bank Transfer';

export interface MediaLocation {
  id: string;
  name: string;
  type: MediaType;
  state: string;
  district: string;
  city: string;
  address: string;
  status: MediaStatus;
  size: string;
  lighting: 'Front Lit' | 'Back Lit' | 'Non-Lit' | 'Digital';
  facing: string;
  imageUrl?: string;
  image: string;
  pricePerMonth: number;
  bookedDates?: { start: string; end: string }[];
  occupancyRate: number;
  totalDaysBooked: number;
  deleted?: boolean;
  deletedAt?: string;
}

export interface Booking {
  id: string;
  mediaId: string;
  customerId: string;
  media?: MediaLocation;
  status: string;
  startDate: string;
  endDate: string;
  amount: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  paymentMode?: PaymentMode;
}

export interface DistrictStats {
  district: string;
  state: string;
  totalMedia: number;
  available: number;
  booked: number;
  comingSoon: number;
  byType: Record<MediaType, { total: number; available: number; booked: number; comingSoon: number }>;
}

// Empty arrays - data will come from backend or be managed by admin
export const states: string[] = [];
export const districts: Record<string, string[]> = {};
export const cities: Record<string, string[]> = {};

export const mediaTypes: MediaType[] = ['Unipole', 'Hoarding', 'Gantry', 'Kiosk', 'Digital LED'];
export const customerGroups = ['Corporate', 'Government', 'Agency', 'Startup', 'Non-Profit'];

// Empty media locations - data from backend
export const mediaLocations: MediaLocation[] = [];

export const getDistrictStats = (): DistrictStats[] => {
  const statsMap = new Map<string, DistrictStats>();

  mediaLocations.forEach(location => {
    const key = `${location.state}-${location.district}`;
    
    if (!statsMap.has(key)) {
      const byType = mediaTypes.reduce((acc, type) => {
        acc[type] = { total: 0, available: 0, booked: 0, comingSoon: 0 };
        return acc;
      }, {} as Record<MediaType, { total: number; available: number; booked: number; comingSoon: number }>);

      statsMap.set(key, {
        district: location.district,
        state: location.state,
        totalMedia: 0,
        available: 0,
        booked: 0,
        comingSoon: 0,
        byType,
      });
    }

    const stats = statsMap.get(key)!;
    stats.totalMedia++;
    
    if (location.status === 'Available') stats.available++;
    else if (location.status === 'Booked') stats.booked++;
    else stats.comingSoon++; 

    stats.byType[location.type].total++;
    if (location.status === 'Available') stats.byType[location.type].available++;
    else if (location.status === 'Booked') stats.byType[location.type].booked++;
    else stats.byType[location.type].comingSoon++;
  });

  return Array.from(statsMap.values());
};

export const getMediaById = (id: string): MediaLocation | undefined => {
  return mediaLocations.find(m => m.id === id);
};

export const getDashboardStats = () => {
  const total = mediaLocations.length;
  const available = mediaLocations.filter(m => m.status === 'Available').length;
  const booked = mediaLocations.filter(m => m.status === 'Booked').length;
  const comingSoon = mediaLocations.filter(m => m.status === 'Coming Soon').length;
  const statesCount = new Set(mediaLocations.map(m => m.state)).size;
  const districtsCount = new Set(mediaLocations.map(m => m.district)).size;

  return { total, available, booked, comingSoon, statesCount, districtsCount };
};

export const getChartData = () => {
  const byCity = mediaLocations.reduce((acc, m) => {
    acc[m.city] = (acc[m.city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cityData = Object.entries(byCity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const stats = getDashboardStats();
  const statusData = [
    { name: 'Available', value: stats.available, fill: 'hsl(var(--success))' },
    { name: 'Booked', value: stats.booked, fill: 'hsl(var(--destructive))' },
    { name: 'Coming Soon', value: stats.comingSoon, fill: 'hsl(var(--warning))' },
  ];

  const monthlyData: { month: string; bookings: number; revenue: number }[] = [];

  return { cityData, statusData, monthlyData };
};

// Empty recent bookings
export const recentBookings: { id: string; mediaId: string; client: string; startDate: string; endDate: string; amount: number }[] = [];

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  group: string;
  totalBookings: number;
  totalSpent: number;
}

// Empty customers array - data from backend
export const customers: Customer[] = [];

export const getBookingsByCustomerId = (_customerId: string): Booking[] => {
  // Will be populated from backend
  return [];
};

// Empty bookings array - data from backend
export const bookings: Booking[] = [];

export const getCustomerById = (id: string) => {
  return customers.find(c => c.id === id);
};

export const getPaymentStats = () => {
  let totalRevenue = 0;
  let pendingDues = 0;
  let partialCount = 0;
  let pendingCount = 0;
  let paidCount = 0;

  bookings.forEach(b => {
    totalRevenue += b.amountPaid;
    pendingDues += (b.amount - b.amountPaid);

    if (b.paymentStatus === 'Partially Paid') partialCount++;
    else if (b.paymentStatus === 'Pending') pendingCount++;
    else if (b.paymentStatus === 'Paid') paidCount++;
  });

  return {
    totalRevenue,
    pendingDues,
    partialCount,
    pendingCount,
    paidCount
  };
};

// Empty tenders - data from backend
export const tenders: TenderAgreement[] = [];

// Empty tax records - data from backend
export const taxRecords: TaxRecord[] = [];

export const getComplianceStats = (): ComplianceStats => {
  const today = new Date();
  
  const expiringTenders = tenders.filter(t => {
    if (t.status === 'Expired') return false;
    const endDate = new Date(t.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  }).length;

  const pendingTaxes = taxRecords.filter(t => t.status === 'Pending').length;
  const overdueTaxes = taxRecords.filter(t => t.status === 'Overdue').length;

  return {
    expiringTenders,
    pendingTaxes,
    overdueTaxes,
    totalActiveTenders: tenders.filter(t => t.status === 'Active').length,
    totalTaxLiability: taxRecords.filter(t => t.status !== 'Paid').reduce((sum, t) => sum + t.amount, 0),
    totalTaxPaid: taxRecords.filter(t => t.status === 'Paid').reduce((sum, t) => sum + t.amount, 0)
  };
};
