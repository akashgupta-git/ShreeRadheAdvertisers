// API Hooks for Media Management with Backend Fallback

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS, isBackendConfigured } from '@/lib/api/config';
import { mediaLocations as staticMedia } from '@/lib/data';
import type {
  MediaLocation,
  ApiResponse,
  PaginatedResponse,
  CreateMediaRequest,
  UpdateMediaRequest,
  MediaFilters,
} from '@/lib/api/types';

// Query Keys
export const mediaKeys = {
  all: ['media'] as const,
  lists: () => [...mediaKeys.all, 'list'] as const,
  list: (filters: MediaFilters) => [...mediaKeys.lists(), filters] as const,
  details: () => [...mediaKeys.all, 'detail'] as const,
  detail: (id: string) => [...mediaKeys.details(), id] as const,
  public: () => [...mediaKeys.all, 'public'] as const,
};

// Fetch all media with filters (admin)
export function useMedia(filters: MediaFilters = {}) {
  return useQuery({
    queryKey: mediaKeys.list(filters),
    queryFn: async () => {
      if (!isBackendConfigured()) {
        // Return static data when backend not configured
        let data = [...staticMedia] as unknown as MediaLocation[];
        if (filters.status) {
          data = data.filter(m => m.status === filters.status);
        }
        if (filters.type) {
          data = data.filter(m => m.type === filters.type);
        }
        if (filters.state) {
          data = data.filter(m => m.state === filters.state);
        }
        if (filters.search) {
          const q = filters.search.toLowerCase();
          data = data.filter(m => 
            m.name.toLowerCase().includes(q) ||
            m.city.toLowerCase().includes(q) ||
            m.id.toLowerCase().includes(q)
          );
        }
        return { success: true, data, pagination: { page: 1, limit: 100, total: data.length, totalPages: 1 } };
      }

      const params: Record<string, string | number | boolean | undefined> = {
        state: filters.state,
        district: filters.district,
        city: filters.city,
        type: filters.type,
        status: filters.status,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        search: filters.search,
      };
      
      const response = await apiClient.get<PaginatedResponse<MediaLocation>>(
        API_ENDPOINTS.MEDIA.LIST,
        params
      );
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Fetch public media (no auth required)
export function usePublicMedia(filters: MediaFilters = {}) {
  return useQuery({
    queryKey: [...mediaKeys.public(), filters],
    queryFn: async () => {
      if (!isBackendConfigured()) {
        let data = staticMedia.filter(m => m.status !== 'Coming Soon') as unknown as MediaLocation[];
        if (filters.type) {
          data = data.filter(m => m.type === filters.type);
        }
        if (filters.state) {
          data = data.filter(m => m.state === filters.state);
        }
        if (filters.city) {
          data = data.filter(m => m.city === filters.city);
        }
        return { success: true, data, pagination: { page: 1, limit: 100, total: data.length, totalPages: 1 } };
      }

      const params: Record<string, string | number | boolean | undefined> = {
        state: filters.state,
        district: filters.district,
        city: filters.city,
        type: filters.type,
        status: filters.status,
        search: filters.search,
      };
      
      const response = await apiClient.get<PaginatedResponse<MediaLocation>>(
        API_ENDPOINTS.MEDIA.PUBLIC,
        params
      );
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Fetch single media by ID
export function useMediaById(id: string) {
  return useQuery({
    queryKey: mediaKeys.detail(id),
    queryFn: async () => {
      if (!isBackendConfigured()) {
        const media = staticMedia.find(m => m.id === id);
        // Fix: Return null or throw error instead of undefined
        if (!media) return null; 
        return media as unknown as MediaLocation;
      }

      const response = await apiClient.get<ApiResponse<MediaLocation>>(
        API_ENDPOINTS.MEDIA.GET(id)
      );
      
      // Fix: Ensure we return the data property or null
      return response?.data || null;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Create new media
export function useCreateMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMediaRequest) => {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured.');
      }

      // Ensure we send the data as-is to the backend
      const response = await apiClient.post<ApiResponse<MediaLocation>>(
        API_ENDPOINTS.MEDIA.CREATE,
        data
      );
      
      return response.data || response; 
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
    },
  });
}
// Update media
export function useUpdateMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMediaRequest }) => {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured.');
      }

      const response = await apiClient.put<MediaLocation>(
        API_ENDPOINTS.MEDIA.UPDATE(id),
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: mediaKeys.detail(variables.id) });
    },
  });
}

// Delete media (soft delete)
export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured. Please set VITE_API_URL.');
      }

      await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.MEDIA.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
    },
  });
}

// Restore media from recycle bin
export function useRestoreMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured. Please set VITE_API_URL.');
      }

      const response = await apiClient.post<ApiResponse<MediaLocation>>(
        API_ENDPOINTS.MEDIA.RESTORE(id)
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
    },
  });
}

// Upload media image (FTP bridge to Hostinger)
export function useUploadMediaImage() {
  return useMutation({
    mutationFn: async ({ file, folder }: { file: File; folder?: string }) => {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured. Please set VITE_API_URL.');
      }

      const response = await apiClient.uploadFile(
        API_ENDPOINTS.UPLOAD.IMAGE,
        file,
        folder ? { folder } : undefined
      );
      return response;
    },
  });
}