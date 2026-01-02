/* eslint-disable @typescript-eslint/no-explicit-any */
// API Hooks for Media Management with Cloudinary Organization
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

// --- UPDATED: ADMIN MEDIA FETCH ---
export function useMedia(filters: MediaFilters = {}) {
  return useQuery({
    queryKey: mediaKeys.list(filters),
    queryFn: async () => {
      // Prioritize Backend
      if (isBackendConfigured()) {
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
        
        return await apiClient.get<PaginatedResponse<MediaLocation>>(
          API_ENDPOINTS.MEDIA.LIST,
          params
        );
      }

      // Local fallback only if no backend URL exists
      let data = [...staticMedia] as unknown as MediaLocation[];
      if (filters.status) data = data.filter(m => m.status === filters.status);
      if (filters.type) data = data.filter(m => m.type === filters.type);
      if (filters.search) {
        const q = filters.search.toLowerCase();
        data = data.filter(m => 
          m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)
        );
      }
      return { success: true, data, pagination: { page: 1, limit: 100, total: data.length, totalPages: 1 } };
    },
    staleTime: 5 * 60 * 1000,
  });
}

// --- FIXED: PUBLIC VIEW PERSISTENCE ---
export function usePublicMedia(filters: MediaFilters = {}) {
  return useQuery({
    queryKey: [...mediaKeys.public(), filters],
    queryFn: async () => {
      // Force fetch from MongoDB to ensure public sees admin changes
      if (isBackendConfigured()) {
        const params: Record<string, string | number | boolean | undefined> = {
          state: filters.state,
          district: filters.district,
          city: filters.city,
          type: filters.type,
          status: filters.status,
          search: filters.search,
        };
        
        return await apiClient.get<PaginatedResponse<MediaLocation>>(
          API_ENDPOINTS.MEDIA.PUBLIC,
          params
        );
      }

      // Offline fallback
      return { 
        success: true, 
        data: staticMedia.filter(m => m.status !== 'Coming Soon') as unknown as MediaLocation[], 
        pagination: { page: 1, limit: 100, total: 0, totalPages: 1 } 
      };
    },
    // Shorter staleTime for public so they see new billboards faster
    staleTime: 1 * 60 * 1000, 
  });
}

// Fetch single media by ID
export function useMediaById(id: string) {
  return useQuery({
    queryKey: mediaKeys.detail(id),
    queryFn: async () => {
      if (isBackendConfigured()) {
        const response = await apiClient.get<ApiResponse<MediaLocation>>(
          API_ENDPOINTS.MEDIA.GET(id) // This should hit /api/media/:id
        );
        // Ensure we return the data property from the API response
        return response?.data || null;
      }

      // Fallback to static data
      const media = staticMedia.find(m => m.id === id);
      return media ? (media as unknown as MediaLocation) : null;
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
      if (!isBackendConfigured()) throw new Error('Backend not configured.');
      const response = await apiClient.post<ApiResponse<MediaLocation>>(API_ENDPOINTS.MEDIA.CREATE, data);
      return response.data || response; 
    },
    onSuccess: () => {
      // Invalidate both admin and public lists so UI updates everywhere
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

// Update media
export function useUpdateMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMediaRequest }) => {
      if (!isBackendConfigured()) throw new Error('Backend not configured.');
      const response = await apiClient.put<ApiResponse<MediaLocation>>(API_ENDPOINTS.MEDIA.UPDATE(id), data);
      return response.data || response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      queryClient.invalidateQueries({ queryKey: mediaKeys.detail(variables.id) });
    },
  });
}

// Delete media (soft delete)
export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!isBackendConfigured()) throw new Error('Backend not configured.');
      await apiClient.delete(API_ENDPOINTS.MEDIA.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

// Restore media from recycle bin
export function useRestoreMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!isBackendConfigured()) throw new Error('Backend not configured.');
      const response = await apiClient.post<ApiResponse<MediaLocation>>(API_ENDPOINTS.MEDIA.RESTORE(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

/**
 * Upload Hook for Cloudinary Organization (Images)
 */
export function useUploadMediaImage() {
  return useMutation({
    mutationFn: async ({ file, customId, district }: { file: File; customId: string; district: string }) => {
      if (!isBackendConfigured()) throw new Error('Backend not configured.');
      return await apiClient.uploadFile(API_ENDPOINTS.UPLOAD.IMAGE, file, { customId, district });
    },
  });
}

/**
 * Upload Hook for Organized Documents (PDFs)
 */
export function useUploadDocument() {
  return useMutation({
    mutationFn: async (payload: { 
      file: File; 
      customId: string; 
      district: string; 
      type: 'tender' | 'tax' | 'general';
      [key: string]: any; 
    }) => {
      if (!isBackendConfigured()) throw new Error('Backend not configured.');
      const { file, ...metadata } = payload;
      const documentEndpoint = API_ENDPOINTS.UPLOAD.DOCUMENT;
      return await apiClient.uploadFile(documentEndpoint, file, metadata);
    },
  });
}