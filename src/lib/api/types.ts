// MongoDB Schema Types for Shree Radhe Advertisers Backend

// ============= ENUMS =============
export type MediaType = 'Unipole' | 'Hoarding' | 'Gantry' | 'Kiosk' | 'Digital LED';
export type MediaStatus = 'Available' | 'Booked' | 'Coming Soon' | 'Maintenance';
export type LightingType = 'Front Lit' | 'Back Lit' | 'Non-Lit' | 'Digital';
export type PaymentStatus = 'Paid' | 'Pending' | 'Partially Paid';
export type PaymentMode = 'Cash' | 'Cheque' | 'Online' | 'Bank Transfer';
export type BookingStatus = 'Active' | 'Upcoming' | 'Completed' | 'Cancelled';
export type CustomerGroup = 'Corporate' | 'Government' | 'Agency' | 'Startup' | 'Non-Profit';
export type MaintenanceStatus = 'Pending' | 'In Progress' | 'Completed';
export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ContactStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Closed';

// ============= COMPLIANCE & DOCUMENTS =============
export type TenderStatus = 'Active' | 'Expiring Soon' | 'Expired';
export type TaxFrequency = 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly' | 'One-Time';
export type TaxStatus = 'Paid' | 'Pending' | 'Overdue';

export interface TenderAgreement {
  id: string;
  tenderName: string;
  tenderNumber: string;
  district: string;
  area: string;
  mediaIds: string[];
  startDate: string;
  endDate: string;
  taxFrequency: TaxFrequency;
  licenseFee: number;
  status: TenderStatus;
  documentUrl?: string;
  deleted?: boolean;
  deletedAt?: string;
}

export interface TaxRecord {
  id: string;
  tenderId: string;
  tenderNumber: string;
  district: string;
  area: string;
  agreementStatus: TenderStatus;
  dueDate: string;
  paymentDate?: string;
  amount: number;
  status: TaxStatus;
  receiptUrl?: string;
  deleted?: boolean;
  deletedAt?: string;
}

export interface ComplianceStats {
  expiringTenders: number;
  pendingTaxes: number;
  overdueTaxes: number;
  totalActiveTenders: number;
  totalTaxLiability: number;
  totalTaxPaid: number;
}

// ============= MEDIA LOCATION =============
export interface MediaLocation {
  _id: string;
  id: string; 
  name: string;
  type: MediaType;
  state: string;
  district: string;
  city: string;
  address: string;
  status: MediaStatus;
  size: string;
  lighting: LightingType;
  facing: string;
  image: string; 
  images?: string[]; 
  pricePerMonth: number;
  latitude?: number;
  longitude?: number;
  landmark?: string;
  bookedDates?: BookedDateRange[];
  occupancyRate: number;
  totalDaysBooked: number;
  deleted?: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookedDateRange {
  start: string;
  end: string;
  bookingId?: string;
}

// ============= BOOKING =============
export interface Booking {
  _id: string;
  id: string; 
  mediaId: string;
  media?: MediaLocation;
  customerId: string;
  customer?: Customer;
  status: BookingStatus;
  startDate: string;
  endDate: string;
  amount: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  paymentMode?: PaymentMode;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
  deletedAt?: string;
}

// ============= CUSTOMER =============
export interface Customer {
  _id: string;
  id: string; 
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  group: CustomerGroup;
  totalBookings: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

// ============= CONTACT FORM =============
export interface ContactSubmission {
  _id: string;
  inquiryId: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  mediaType?: MediaType;
  message: string;
  status: ContactStatus;
  attended: boolean;
  attendedAt?: string;
  notes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

// ============= PAYMENT =============
export interface Payment {
  _id: string;
  id: string;
  bookingId: string;
  booking?: Booking;
  customerId: string;
  customer?: Customer;
  amount: number;
  mode: PaymentMode;
  status: 'Completed' | 'Pending' | 'Failed';
  transactionId?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============= MAINTENANCE =============
export interface MaintenanceRecord {
  _id: string;
  id: string;
  mediaId: string;
  media?: MediaLocation;
  title: string;
  description: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  scheduledDate: string;
  completedDate?: string;
  cost?: number;
  assignedTo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============= ADMIN USER =============
export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'superadmin' | 'viewer';
  name: string;
  lastLogin?: string;
  createdAt: string;
}

// ============= API RESPONSES =============
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AdminUser;
  expiresIn: number;
}

// ============= ANALYTICS =============
export interface DashboardStats {
  totalMedia: number;
  available: number;
  booked: number;
  comingSoon: number;
  maintenance: number;
  statesCount: number;
  districtsCount: number;
  totalCustomers: number;
  activeBookings: number;
  totalRevenue: number;
  pendingPayments: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
}

export interface OccupancyData {
  mediaId: string;
  mediaName: string;
  occupancyRate: number;
  totalDaysBooked: number;
}

// ============= REQUEST TYPES =============
export interface CreateMediaRequest {
  id?: string; // Optional custom ID - if not provided, system generates one
  name: string;
  type: MediaType;
  state: string;
  district: string;
  city: string;
  address: string;
  status: MediaStatus;
  size: string;
  lighting: LightingType;
  facing: string;
  pricePerMonth: number;
  latitude?: number;
  longitude?: number;
  landmark?: string;
}

export interface UpdateMediaRequest extends Partial<CreateMediaRequest> {
  image?: string;
  images?: string[];
}

export interface CreateBookingRequest {
  mediaId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  amount: number;
  notes?: string;
}

export interface CreateCustomerRequest {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  group: CustomerGroup;
}

export interface ContactFormRequest {
  name: string;
  email: string;
  phone: string;
  company?: string;
  mediaType?: MediaType;
  message: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface CreatePaymentRequest {
  bookingId: string;
  amount: number;
  mode: PaymentMode;
  transactionId?: string;
  notes?: string;
}

export interface CreateMaintenanceRequest {
  mediaId: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  scheduledDate: string;
  cost?: number;
  assignedTo?: string;
}

// ============= FILTER TYPES =============
export interface MediaFilters {
  state?: string;
  district?: string;
  city?: string;
  type?: MediaType;
  status?: MediaStatus;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface BookingFilters {
  customerId?: string;
  mediaId?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
}

export interface CentralBinItem {
  id: string;
  type: 'media' | 'booking' | 'customer' | 'payment' | 'agreement' | 'tax' | 'maintenance';
  displayName: string;
  subText: string;
  deletedAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  originalData?: any;
}