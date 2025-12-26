// API Hooks for Contact Form Submissions with Backend Fallback

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS, isBackendConfigured } from '@/lib/api/config';
import type {
  ContactSubmission,
  ApiResponse,
  PaginatedResponse,
  ContactFormRequest,
  ContactStatus,
} from '@/lib/api/types';

// Query Keys
export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (filters?: { status?: ContactStatus }) => [...contactKeys.lists(), filters] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
};

// Submit contact form (Public)
export function useSubmitContact() {
  return useMutation({
    mutationFn: async (data: ContactFormRequest) => {
      if (!isBackendConfigured()) {
        // Simulate success for demo
        console.log('Contact form submitted (demo mode):', data);
        return { success: true, id: 'demo-' + Date.now() };
      }

      const response = await apiClient.post<ApiResponse<{ id: string }>>(
        API_ENDPOINTS.CONTACT.SUBMIT,
        data
      );
      return response;
    },
  });
}

// Fetch all contact submissions (Admin)
export function useContactSubmissions(filters?: { status?: ContactStatus }) {
  return useQuery({
    queryKey: contactKeys.list(filters),
    queryFn: async () => {
      if (!isBackendConfigured()) {
        return { success: true, data: [], total: 0 };
      }

      const response = await apiClient.get<PaginatedResponse<ContactSubmission>>(
        API_ENDPOINTS.CONTACT.LIST,
        filters
      );
      return response;
    },
    staleTime: 2 * 60 * 1000,
  });
}

// Fetch single contact submission
export function useContactById(id: string) {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: async () => {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured');
      }

      const response = await apiClient.get<ApiResponse<ContactSubmission>>(
        API_ENDPOINTS.CONTACT.GET(id)
      );
      return response.data;
    },
    enabled: !!id && isBackendConfigured(),
  });
}

// Update contact submission status
export function useUpdateContactStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: ContactStatus; notes?: string }) => {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured. Please set VITE_API_URL.');
      }

      const response = await apiClient.patch<ApiResponse<ContactSubmission>>(
        API_ENDPOINTS.CONTACT.UPDATE_STATUS(id),
        { status, notes }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(variables.id) });
    },
  });
}

export function useMarkAsAttended() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Provide the generic type <ApiResponse<ContactSubmission>>
      const response = await apiClient.patch<ApiResponse<ContactSubmission>>(
        `/api/contact/${id}/attend`
      );
      // Now VS Code knows 'data' is a ContactSubmission object
      return response.data;
    },
    onSuccess: () => {
      // This invalidates all contact-related queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
  });
}

// Hook to handle moving inquiries back to active status
export function useUnmarkAsAttended() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch<ApiResponse<ContactSubmission>>(
        `/api/contact/${id}/unattend`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all }); // Refresh all lists
    },
  });
}