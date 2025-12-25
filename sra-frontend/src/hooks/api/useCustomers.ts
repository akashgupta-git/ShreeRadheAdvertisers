// API Hooks for Customers Management with Backend Fallback

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS, isBackendConfigured } from '@/lib/api/config';
import { customers as staticCustomers } from '@/lib/data';
import type {
  Customer,
  ApiResponse,
  PaginatedResponse,
  CreateCustomerRequest,
} from '@/lib/api/types';

// Query Keys
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters?: { search?: string; group?: string }) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

// Fetch all customers
export function useCustomers(filters?: { search?: string; group?: string }) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: async () => {
      if (!isBackendConfigured()) {
        let data = [...staticCustomers];
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          data = data.filter(c => 
            c.name.toLowerCase().includes(q) ||
            c.company.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q)
          );
        }
        if (filters?.group && filters.group !== 'all') {
          data = data.filter(c => c.group === filters.group);
        }
        return { success: true, data, total: data.length, page: 1, limit: 100 };
      }

      const response = await apiClient.get<PaginatedResponse<Customer>>(
        API_ENDPOINTS.CUSTOMERS.LIST,
        filters
      );
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Fetch single customer by ID
export function useCustomerById(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: async () => {
      if (!isBackendConfigured()) {
        const customer = staticCustomers.find(c => c.id === id);
        if (!customer) throw new Error('Customer not found');
        return customer;
      }

      const response = await apiClient.get<ApiResponse<Customer>>(
        API_ENDPOINTS.CUSTOMERS.GET(id)
      );
      return response.data;
    },
    enabled: !!id,
  });
}

// Create new customer
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCustomerRequest) => {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured. Please set VITE_API_URL.');
      }

      const response = await apiClient.post<ApiResponse<Customer>>(
        API_ENDPOINTS.CUSTOMERS.CREATE,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

// Update customer
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Customer> }) => {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured. Please set VITE_API_URL.');
      }

      const response = await apiClient.put<ApiResponse<Customer>>(
        API_ENDPOINTS.CUSTOMERS.UPDATE(id),
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) });
    },
  });
}

// Delete customer
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured. Please set VITE_API_URL.');
      }

      await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.CUSTOMERS.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}
