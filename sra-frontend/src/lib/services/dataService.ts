// Data Service - Provides unified interface for data access
// Uses API when backend is configured, falls back to static data otherwise

import { API_BASE_URL } from '@/lib/api/config';
import type { 
  MediaLocation as ApiMediaLocation, 
  Booking as ApiBooking,
  Customer as ApiCustomer,
  MediaFilters,
  BookingFilters,
} from '@/lib/api/types';

// Re-export types for components
export type { MediaFilters, BookingFilters };

// Check if backend is properly configured
export const isBackendConfigured = (): boolean => {
  const url = API_BASE_URL;
  return !!url && url !== 'http://localhost:5000' && !url.includes('your-backend');
};

// Type adapter: Convert API types to frontend types
export const adaptMediaLocation = (apiMedia: ApiMediaLocation) => ({
  id: apiMedia.id || apiMedia._id,
  name: apiMedia.name,
  type: apiMedia.type,
  state: apiMedia.state,
  district: apiMedia.district,
  city: apiMedia.city,
  address: apiMedia.address,
  status: apiMedia.status,
  size: apiMedia.size,
  lighting: apiMedia.lighting,
  facing: apiMedia.facing,
  image: apiMedia.image,
  images: apiMedia.images,
  pricePerMonth: apiMedia.pricePerMonth,
  latitude: apiMedia.latitude,
  longitude: apiMedia.longitude,
  landmark: apiMedia.landmark,
  occupancyRate: apiMedia.occupancyRate,
  totalDaysBooked: apiMedia.totalDaysBooked,
  bookedDates: apiMedia.bookedDates,
  deleted: apiMedia.deleted,
  deletedAt: apiMedia.deletedAt,
  createdAt: apiMedia.createdAt,
  updatedAt: apiMedia.updatedAt,
});

export const adaptBooking = (apiBooking: ApiBooking) => ({
  id: apiBooking.id || apiBooking._id,
  mediaId: apiBooking.mediaId,
  customerId: apiBooking.customerId,
  media: apiBooking.media ? adaptMediaLocation(apiBooking.media) : undefined,
  customer: apiBooking.customer,
  status: apiBooking.status,
  startDate: apiBooking.startDate,
  endDate: apiBooking.endDate,
  amount: apiBooking.amount,
  amountPaid: apiBooking.amountPaid,
  paymentStatus: apiBooking.paymentStatus,
  paymentMode: apiBooking.paymentMode,
  notes: apiBooking.notes,
  createdAt: apiBooking.createdAt,
  updatedAt: apiBooking.updatedAt,
});

export const adaptCustomer = (apiCustomer: ApiCustomer) => ({
  id: apiCustomer.id || apiCustomer._id,
  name: apiCustomer.name,
  company: apiCustomer.company,
  email: apiCustomer.email,
  phone: apiCustomer.phone,
  address: apiCustomer.address,
  group: apiCustomer.group,
  totalBookings: apiCustomer.totalBookings,
  totalSpent: apiCustomer.totalSpent,
  createdAt: apiCustomer.createdAt,
  updatedAt: apiCustomer.updatedAt,
});

// Format currency (Indian Rupees)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Status color mapping
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Available':
      return 'success';
    case 'Booked':
    case 'Active':
      return 'destructive';
    case 'Coming Soon':
    case 'Upcoming':
      return 'warning';
    case 'Maintenance':
      return 'muted';
    case 'Completed':
      return 'primary';
    default:
      return 'muted';
  }
};

// Payment status color mapping
export const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case 'Paid':
      return 'success';
    case 'Pending':
      return 'destructive';
    case 'Partially Paid':
      return 'warning';
    default:
      return 'muted';
  }
};
