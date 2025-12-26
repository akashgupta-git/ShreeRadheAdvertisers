// API Hooks for Analytics & Dashboard Data with Backend Fallback
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS, isBackendConfigured } from '@/lib/api/config';
import { 
  getDashboardStats as getMockDashboardStats, 
  getChartData, 
  getPaymentStats,
  getComplianceStats 
} from '@/lib/data';
import type {
  RevenueData,
  OccupancyData,
  ApiResponse,
} from '@/lib/api/types';

/**
 * DASHBOARD INTERFACE
 * Matches the live response from sra-backend/src/routes/analytics.js
 */
export interface DashboardStats {
  totalMedia: number;
  available: number;
  booked: number;
  comingSoon: number;
  maintenance: number;
  statesCount: number;
  districtsCount: number;
  totalCustomers: number;
  activeBookings: number;
  totalRevenue: number;
  pendingPayments: number;
  // Live leads data from your Inquiry Management update
  totalInquiries: number; 
  newInquiries: number;   
}

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

// --- HOOKS ---

// 1. Fetch live dashboard stats (including Leads/Inquiries)
export function useDashboardStats() {
  return useQuery({
    queryKey: analyticsKeys.dashboard(),
    queryFn: async () => {
      if (!isBackendConfigured()) {
        // Fallback to mock data and cast to our interface
        return getMockDashboardStats() as unknown as DashboardStats;
      }

      const response = await apiClient.get<DashboardStats>(
        API_ENDPOINTS.ANALYTICS.DASHBOARD
      );
      // Backend returns the object directly or wrapped in ApiResponse based on your client setup
      return response as unknown as DashboardStats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// 2. Chart data (city, status, monthly)
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

// 3. Payment stats for analytics
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

// 4. Compliance stats (Tenders/Taxes)
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

// 5. Fetch revenue data
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

// 6. Fetch occupancy data (Live billboard booking rates)
export function useOccupancyData() {
  return useQuery({
    queryKey: analyticsKeys.occupancy(),
    queryFn: async () => {
      if (!isBackendConfigured()) {
        return [] as OccupancyData[];
      }

      const response = await apiClient.get<OccupancyData[]>(
        API_ENDPOINTS.ANALYTICS.OCCUPANCY
      );
      return response as unknown as OccupancyData[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

// 7. Fetch trends data (Growth rates)
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

// 8. Fetch city revenue loss data (Vacant site impact)
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

// 9. Fetch vacant sites for a specific city
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

// 10. Fetch monthly revenue trend (Bar chart data)
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

// 11. Fetch state revenue distribution (Pie chart data)
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