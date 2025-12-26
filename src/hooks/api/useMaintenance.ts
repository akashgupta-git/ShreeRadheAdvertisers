// API Hooks for Maintenance Records with Backend Fallback

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS, isBackendConfigured } from '@/lib/api/config';
import type {
  MaintenanceRecord,
  ApiResponse,
  PaginatedResponse,
  CreateMaintenanceRequest,
  MaintenanceStatus,
  MaintenancePriority,
} from '@/lib/api/types';

// Static maintenance data for preview
const staticMaintenance = [
  {
    id: 'MAINT-001',
    mediaId: 'SRA-001',
    maintenanceType: 'Repair',
    description: 'LED panel replacement',
    status: 'Pending' as MaintenanceStatus,
    priority: 'High' as MaintenancePriority,
    scheduledDate: '2024-02-15',
    cost: 15000,
    createdAt: '2024-02-01',
  },
  {
    id: 'MAINT-002',
    mediaId: 'SRA-003',
    maintenanceType: 'Cleaning',
    description: 'Regular hoarding cleaning',
    status: 'Completed' as MaintenanceStatus,
    priority: 'Low' as MaintenancePriority,
    scheduledDate: '2024-02-10',
    completedDate: '2024-02-10',
    cost: 5000,
    createdAt: '2024-02-05',
  },
];

// Query Keys
export const maintenanceKeys = {
  all: ['maintenance'] as const,
  lists: () => [...maintenanceKeys.all, 'list'] as const,
  list: (filters?: { status?: MaintenanceStatus; priority?: MaintenancePriority; mediaId?: string }) => 
    [...maintenanceKeys.lists(), filters] as const,
  details: () => [...maintenanceKeys.all, 'detail'] as const,
  detail: (id: string) => [...maintenanceKeys.details(), id] as const,
};

// Fetch all maintenance records
export function useMaintenance(filters?: { 
  status?: MaintenanceStatus; 
  priority?: MaintenancePriority; 
  mediaId?: string 
}) {
  return useQuery({
    queryKey: maintenanceKeys.list(filters),
    queryFn: async () => {
      if (!isBackendConfigured()) {
        let data = [...staticMaintenance];
        if (filters?.status) {
          data = data.filter(m => m.status === filters.status);
        }
        if (filters?.mediaId) {
          data = data.filter(m => m.mediaId === filters.mediaId);
        }
        if (filters?.priority) {
          data = data.filter(m => m.priority === filters.priority);
        }
        return { success: true, data, total: data.length };
      }

      const response = await apiClient.get<PaginatedResponse<MaintenanceRecord>>(
        API_ENDPOINTS.MAINTENANCE.LIST,
        filters
      );
      return response;
    },
    staleTime: 2 * 60 * 1000,
  });
}

// Fetch single maintenance record by ID
export function useMaintenanceById(id: string) {
  return useQuery({
    queryKey: maintenanceKeys.detail(id),
    queryFn: async () => {
      if (!isBackendConfigured()) {
        const record = staticMaintenance.find(m => m.id === id);
        if (!record) throw new Error('Maintenance record not found');
        return record;
      }

      const response = await apiClient.get<ApiResponse<MaintenanceRecord>>(
        API_ENDPOINTS.MAINTENANCE.GET(id)
      );
      return response.data;
    },
    enabled: !!id,
  });
}

// Create new maintenance record
export function useCreateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMaintenanceRequest) => {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured. Please set VITE_API_URL.');
      }

      const response = await apiClient.post<ApiResponse<MaintenanceRecord>>(
        API_ENDPOINTS.MAINTENANCE.CREATE,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
    },
  });
}

// Update maintenance record
export function useUpdateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MaintenanceRecord> }) => {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured. Please set VITE_API_URL.');
      }

      const response = await apiClient.put<ApiResponse<MaintenanceRecord>>(
        API_ENDPOINTS.MAINTENANCE.UPDATE(id),
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.detail(variables.id) });
    },
  });
}

// Complete maintenance
export function useCompleteMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured. Please set VITE_API_URL.');
      }

      const response = await apiClient.patch<ApiResponse<MaintenanceRecord>>(
        API_ENDPOINTS.MAINTENANCE.COMPLETE(id),
        { notes }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.detail(variables.id) });
    },
  });
}
