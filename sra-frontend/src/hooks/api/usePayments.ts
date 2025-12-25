// API Hooks for Payments Management with Backend Fallback

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS, isBackendConfigured } from '@/lib/api/config';
import { bookings as staticBookings, getPaymentStats } from '@/lib/data';
import type {
  Payment,
  ApiResponse,
  PaginatedResponse,
  CreatePaymentRequest,
} from '@/lib/api/types';

// Query Keys
export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (filters?: { status?: string; bookingId?: string }) => [...paymentKeys.lists(), filters] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
  stats: () => [...paymentKeys.all, 'stats'] as const,
};

// Fetch all payments
export function usePayments(filters?: { status?: string; bookingId?: string }) {
  return useQuery({
    queryKey: paymentKeys.list(filters),
    queryFn: async () => {
      if (!isBackendConfigured()) {
        // Transform bookings to payment-like data for preview
        const payments = staticBookings.map(b => ({
          id: `PAY-${b.id}`,
          bookingId: b.id,
          customerId: b.customerId,
          amount: b.amountPaid,
          totalAmount: b.amount,
          status: b.paymentStatus,
          mode: b.paymentMode,
          date: b.startDate,
        }));
        return { success: true, data: payments as unknown as Payment[], total: payments.length };
      }

      const response = await apiClient.get<PaginatedResponse<Payment>>(
        API_ENDPOINTS.PAYMENTS.LIST,
        filters
      );
      return response;
    },
    staleTime: 2 * 60 * 1000,
  });
}

// Fetch single payment by ID
export function usePaymentById(id: string) {
  return useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: async () => {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured');
      }

      const response = await apiClient.get<ApiResponse<Payment>>(
        API_ENDPOINTS.PAYMENTS.GET(id)
      );
      return response.data;
    },
    enabled: !!id && isBackendConfigured(),
  });
}

// Fetch payment stats
export function usePaymentStats() {
  return useQuery({
    queryKey: paymentKeys.stats(),
    queryFn: async () => {
      if (!isBackendConfigured()) {
        return getPaymentStats();
      }

      const response = await apiClient.get<ApiResponse<{
        totalRevenue: number;
        pendingDues: number;
        partialCount: number;
        pendingCount: number;
        paidCount: number;
      }>>(API_ENDPOINTS.PAYMENTS.STATS);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Create new payment
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePaymentRequest) => {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured. Please set VITE_API_URL.');
      }

      const response = await apiClient.post<ApiResponse<Payment>>(
        API_ENDPOINTS.PAYMENTS.CREATE,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.stats() });
    },
  });
}

// Update payment
export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Payment> }) => {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured. Please set VITE_API_URL.');
      }

      const response = await apiClient.put<ApiResponse<Payment>>(
        API_ENDPOINTS.PAYMENTS.UPDATE(id),
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: paymentKeys.stats() });
    },
  });
}

// Delete payment
export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured. Please set VITE_API_URL.');
      }

      await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.PAYMENTS.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.stats() });
    },
  });
}
