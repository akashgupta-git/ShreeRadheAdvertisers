// API Hooks for Analytics & Dashboard Data with Backend Fallback

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS, isBackendConfigured } from '@/lib/api/config';
import { 
  getDashboardStats, 
  getChartData, 
  getPaymentStats,
  getComplianceStats 
} from '@/lib/data';
import type {
  DashboardStats,
  RevenueData,
  OccupancyData,
  ApiResponse,
} from '@/lib/api/types';

// Types for analytics data
export interface CityLossData {
  name: string;
  count: number;
  loss: number;
}

export interface VacantSite {
  id: string;
  name: string;
  type: string;
  address: string;
  pricePerMonth: number;
  size: string;
  lighting: string;
  facing: string;
  daysVacant: number;
}

export interface VacantSitesResponse {
  city: string;
  count: number;
  monthlyLoss: number;
  sites: VacantSite[];
}

export interface MonthlyTrendData {
  month: string;
  bookings: number;
  revenue: number;
}

export interface StateRevenueData {
  name: string;
  value: number;
  count: number;
}

// Query Keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: () => [...analyticsKeys.all, 'dashboard'] as const,
  revenue: (period?: string) => [...analyticsKeys.all, 'revenue', period] as const,
  occupancy: () => [...analyticsKeys.all, 'occupancy'] as const,
  trends: (period?: string) => [...analyticsKeys.all, 'trends', period] as const,
  cityLoss: () => [...analyticsKeys.all, 'city-loss'] as const,
  vacantSites: (city: string) => [...analyticsKeys.all, 'vacant-sites', city] as const,
  revenueTrend: () => [...analyticsKeys.all, 'revenue-trend'] as const,
  stateRevenue: () => [...analyticsKeys.all, 'state-revenue'] as const,
  charts: () => [...analyticsKeys.all, 'charts'] as const,
  paymentStats: () => [...analyticsKeys.all, 'paymentStats'] as const,
  compliance: () => [...analyticsKeys.all, 'compliance'] as const,
};

// Fetch dashboard stats
export function useDashboardStats() {
  return useQuery({
    queryKey: analyticsKeys.dashboard(),
    queryFn: async () => {
      if (!isBackendConfigured()) {
        return getDashboardStats();
      }

      const response = await apiClient.get<ApiResponse<DashboardStats>>(
        API_ENDPOINTS.ANALYTICS.DASHBOARD
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Chart data (city, status, monthly)
export function useChartData() {
  return useQuery({
    queryKey: analyticsKeys.charts(),
    queryFn: async () => {
      if (!isBackendConfigured()) {
        return getChartData();
      }

      const response = await apiClient.get<ApiResponse<ReturnType<typeof getChartData>>>(
        API_ENDPOINTS.ANALYTICS.TRENDS
      );
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

// Payment stats for analytics
export function usePaymentStatsAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.paymentStats(),
    queryFn: async () => {
      if (!isBackendConfigured()) {
        return getPaymentStats();
      }

      const response = await apiClient.get<ApiResponse<ReturnType<typeof getPaymentStats>>>(
        API_ENDPOINTS.PAYMENTS.STATS
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Compliance stats
export function useComplianceStats() {
  return useQuery({
    queryKey: analyticsKeys.compliance(),
    queryFn: async () => {
      if (!isBackendConfigured()) {
        return getComplianceStats();
      }

      const response = await apiClient.get<ApiResponse<ReturnType<typeof getComplianceStats>>>(
        API_ENDPOINTS.COMPLIANCE.STATS
      );
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

// Fetch revenue data
export function useRevenueData(period: 'monthly' | 'quarterly' | 'yearly' = 'monthly') {
  return useQuery({
    queryKey: analyticsKeys.revenue(period),
    queryFn: async () => {
      if (!isBackendConfigured()) {
        return [] as RevenueData[];
      }

      const response = await apiClient.get<ApiResponse<RevenueData[]>>(
        API_ENDPOINTS.ANALYTICS.REVENUE,
        { period }
      );
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

// Fetch occupancy data
export function useOccupancyData() {
  return useQuery({
    queryKey: analyticsKeys.occupancy(),
    queryFn: async () => {
      if (!isBackendConfigured()) {
        return [] as OccupancyData[];
      }

      const response = await apiClient.get<ApiResponse<OccupancyData[]>>(
        API_ENDPOINTS.ANALYTICS.OCCUPANCY
      );
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

// Fetch trends data
export function useTrendsData(period: 'week' | 'month' | 'year' = 'month') {
  return useQuery({
    queryKey: analyticsKeys.trends(period),
    queryFn: async () => {
      if (!isBackendConfigured()) {
        return {
          bookingTrend: 0,
          revenueTrend: 0,
          occupancyTrend: 0,
          customerTrend: 0,
        };
      }

      const response = await apiClient.get<ApiResponse<{
        bookingTrend: number;
        revenueTrend: number;
        occupancyTrend: number;
        customerTrend: number;
      }>>(API_ENDPOINTS.ANALYTICS.TRENDS, { period });
      return response.data;
    },
    staleTime: 15 * 60 * 1000,
  });
}

// Fetch city revenue loss data
export function useCityLossData() {
  return useQuery({
    queryKey: analyticsKeys.cityLoss(),
    queryFn: async () => {
      if (!isBackendConfigured()) {
        return [] as CityLossData[];
      }

      const response = await apiClient.get<CityLossData[]>(
        API_ENDPOINTS.ANALYTICS.CITY_LOSS
      );
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Fetch vacant sites for a specific city
export function useVacantSites(city: string | null) {
  return useQuery({
    queryKey: analyticsKeys.vacantSites(city || ''),
    queryFn: async () => {
      if (!city) return null;
      if (!isBackendConfigured()) {
        return null;
      }

      const response = await apiClient.get<VacantSitesResponse>(
        API_ENDPOINTS.ANALYTICS.VACANT_SITES(city)
      );
      return response;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!city,
  });
}

// Fetch monthly revenue trend
export function useRevenueTrend() {
  return useQuery({
    queryKey: analyticsKeys.revenueTrend(),
    queryFn: async () => {
      if (!isBackendConfigured()) {
        const { monthlyData } = getChartData();
        return monthlyData;
      }

      const response = await apiClient.get<MonthlyTrendData[]>(
        API_ENDPOINTS.ANALYTICS.REVENUE_TREND
      );
      return response;
    },
    staleTime: 10 * 60 * 1000,
  });
}

// Fetch state revenue distribution
export function useStateRevenue() {
  return useQuery({
    queryKey: analyticsKeys.stateRevenue(),
    queryFn: async () => {
      if (!isBackendConfigured()) {
        return [] as StateRevenueData[];
      }

      const response = await apiClient.get<StateRevenueData[]>(
        API_ENDPOINTS.ANALYTICS.STATE_REVENUE
      );
      return response;
    },
    staleTime: 10 * 60 * 1000,
  });
}
