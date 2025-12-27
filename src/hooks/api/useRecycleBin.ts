// API Hooks for Recycle Bin Management

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { isBackendConfigured } from '@/lib/api/config';
import type { CentralBinItem } from '@/lib/api/types';

// Query Keys
export const recycleBinKeys = {
  all: ['recycleBin'] as const,
  list: () => [...recycleBinKeys.all, 'list'] as const,
};

export interface RecycleBinApiItem {
  id: string;
  type: 'media' | 'customer' | 'booking' | 'tender' | 'tax';
  displayName: string;
  subText: string;
  deletedAt: string;
}

// Fetch all deleted items
export function useRecycleBinItems() {
  return useQuery({
    queryKey: recycleBinKeys.list(),
    queryFn: async (): Promise<CentralBinItem[]> => {
      if (!isBackendConfigured()) {
        // Return empty when backend not configured
        return [];
      }

      const response = await apiClient.get<RecycleBinApiItem[]>('/api/recycle-bin');
      
      // Map backend format to frontend format
      return response.map(item => ({
        id: item.id,
        type: item.type as CentralBinItem['type'],
        displayName: item.displayName,
        subText: item.subText,
        deletedAt: item.deletedAt,
      }));
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Restore item from recycle bin
export function useRestoreFromBin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, type }: { id: string; type: string }) => {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured');
      }

      await apiClient.post('/api/recycle-bin/restore', { id, type });
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: recycleBinKeys.list() });
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

// Permanently delete item
export function usePermanentDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, type }: { id: string; type: string }) => {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured');
      }

      await apiClient.delete('/api/recycle-bin/delete');
      // Note: Backend expects body in DELETE, we need to use POST with different endpoint
      // Or update backend to accept query params
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recycleBinKeys.list() });
    },
  });
}

// Bulk restore all items
export function useRestoreAllFromBin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: { id: string; type: string }[]) => {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured');
      }

      // Restore all items sequentially
      for (const item of items) {
        await apiClient.post('/api/recycle-bin/restore', { id: item.id, type: item.type });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recycleBinKeys.list() });
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
