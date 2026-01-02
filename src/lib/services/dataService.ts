/* eslint-disable @typescript-eslint/no-explicit-any */
// Data Service - Provides unified interface for data access
// Uses API when backend is configured, falls back to static data otherwise

import { API_BASE_URL } from '@/lib/api/config';
import type { 
  MediaLocation as ApiMediaLocation, 
  Booking as ApiBooking,
  Customer as ApiCustomer,
  MediaFilters,
  BookingFilters,
  MediaLocation, // Import the main interface to enforce types
} from '@/lib/api/types';

// Re-export types for components
export type { MediaFilters, BookingFilters };

// Check if backend is properly configured
export const isBackendConfigured = (): boolean => {
  const url = API_BASE_URL;
  return !!url && url !== 'http://localhost:5000' && !url.includes('https://shreeradhe-backend.onrender.com');
};

/**
 * Type adapter: Convert API types to frontend types
 * FIX: Explicitly typed as MediaLocation to resolve "Property imageUrl does not exist"
 */
export const adaptMediaLocation = (apiMedia: any): MediaLocation => {
  // Bridge the naming gap: ensure we have a valid string for the image source
  const finalImageUrl = apiMedia.imageUrl || apiMedia.image || '';

  return {
    _id: apiMedia._id,
    id: apiMedia.id || apiMedia._id,
    name: apiMedia.name || 'Unnamed Location',
    type: apiMedia.type || 'Hoarding',
    state: apiMedia.state || '',
    district: apiMedia.district || 'N/A',
    city: apiMedia.city || 'N/A',
    address: apiMedia.address || '',
    status: apiMedia.status || 'Available',
    
    // Primary field for Hostinger SSD URLs
    imageUrl: finalImageUrl,
    
    // Compatibility field for legacy components
    image: finalImageUrl,
    
    // Ensure technical specifications flow correctly from DB
    size: apiMedia.size || 'Standard',
    lighting: apiMedia.lighting || 'Non-Lit',
    facing: apiMedia.facing || 'N/A',
    
    pricePerMonth: Number(apiMedia.pricePerMonth) || 0,
    landmark: apiMedia.landmark || '',
    occupancyRate: apiMedia.occupancyRate || 0,
    totalDaysBooked: apiMedia.totalDaysBooked || 0,
    bookedDates: apiMedia.bookedDates || [],
    deleted: apiMedia.deleted || false,
    createdAt: apiMedia.createdAt || new Date().toISOString(),
    updatedAt: apiMedia.updatedAt || new Date().toISOString(),
  };
};

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
  if (!dateString) return 'N/A';
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