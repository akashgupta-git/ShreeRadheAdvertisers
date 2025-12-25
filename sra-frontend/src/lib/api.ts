/**
 * API Bridge for Shree Radhe Advertisers
 * Single point of communication between frontend and backend
 */

import { API_BASE_URL, API_ENDPOINTS, AUTH_TOKEN_KEY } from './api/config';
import type {
  MediaLocation,
  MediaFilters,
  Customer,
  Booking,
  BookingFilters,
  Payment,
  MaintenanceRecord,
  ContactSubmission,
  DashboardStats,
  RevenueData,
  CreateMediaRequest,
  UpdateMediaRequest,
  CreateBookingRequest,
  CreateCustomerRequest,
  CreatePaymentRequest,
  CreateMaintenanceRequest,
  ContactFormRequest,
  LoginRequest,
  AuthResponse,
  AdminUser,
  TenderAgreement,
  TaxRecord,
  ComplianceStats,
} from './api/types';

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

interface CityLossItem {
  name: string;
  count: number;
  loss: number;
}

interface VacantSite {
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

interface VacantSitesResponse {
  city: string;
  count: number;
  monthlyLoss: number;
  sites: VacantSite[];
}

interface StateRevenueItem {
  name: string;
  value: number;
  count: number;
}

class SRAApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    let url = `${this.baseUrl}${endpoint}`;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Request failed: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async verifyToken(): Promise<{ valid: boolean; user: AdminUser }> {
    return this.request(API_ENDPOINTS.AUTH.VERIFY);
  }

  async logout(): Promise<void> {
    await this.request(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' });
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  // Media
  async getMedia(filters?: MediaFilters): Promise<PaginatedResult<MediaLocation>> {
    return this.request(API_ENDPOINTS.MEDIA.LIST, {}, filters as Record<string, string | number | boolean | undefined>);
  }

  async getMediaById(id: string): Promise<MediaLocation> {
    return this.request(API_ENDPOINTS.MEDIA.GET(id));
  }

  async createMedia(data: CreateMediaRequest): Promise<MediaLocation> {
    return this.request(API_ENDPOINTS.MEDIA.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMedia(id: string, data: UpdateMediaRequest): Promise<MediaLocation> {
    return this.request(API_ENDPOINTS.MEDIA.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMedia(id: string): Promise<void> {
    return this.request(API_ENDPOINTS.MEDIA.DELETE(id), { method: 'DELETE' });
  }

  // Customers
  async getCustomers(filters?: { group?: string; search?: string }): Promise<PaginatedResult<Customer>> {
    return this.request(API_ENDPOINTS.CUSTOMERS.LIST, {}, filters);
  }

  async getCustomerById(id: string): Promise<Customer> {
    return this.request(API_ENDPOINTS.CUSTOMERS.GET(id));
  }

  async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
    return this.request(API_ENDPOINTS.CUSTOMERS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomer(id: string, data: Partial<CreateCustomerRequest>): Promise<Customer> {
    return this.request(API_ENDPOINTS.CUSTOMERS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCustomer(id: string): Promise<void> {
    return this.request(API_ENDPOINTS.CUSTOMERS.DELETE(id), { method: 'DELETE' });
  }

  // Bookings
  async getBookings(filters?: BookingFilters): Promise<PaginatedResult<Booking>> {
    return this.request(API_ENDPOINTS.BOOKINGS.LIST, {}, filters as Record<string, string | number | boolean | undefined>);
  }

  async getBookingById(id: string): Promise<Booking> {
    return this.request(API_ENDPOINTS.BOOKINGS.GET(id));
  }

  async getBookingsByCustomer(customerId: string): Promise<Booking[]> {
    const result = await this.request<PaginatedResult<Booking>>(API_ENDPOINTS.BOOKINGS.BY_CUSTOMER(customerId));
    return result.data;
  }

  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    return this.request(API_ENDPOINTS.BOOKINGS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBooking(id: string, data: Partial<Booking>): Promise<Booking> {
    return this.request(API_ENDPOINTS.BOOKINGS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBooking(id: string): Promise<void> {
    return this.request(API_ENDPOINTS.BOOKINGS.DELETE(id), { method: 'DELETE' });
  }

  // Payments
  async getPayments(filters?: { bookingId?: string; customerId?: string }): Promise<PaginatedResult<Payment>> {
    return this.request(API_ENDPOINTS.PAYMENTS.LIST, {}, filters);
  }

  async getPaymentById(id: string): Promise<Payment> {
    return this.request(API_ENDPOINTS.PAYMENTS.GET(id));
  }

  async createPayment(data: CreatePaymentRequest): Promise<Payment> {
    return this.request(API_ENDPOINTS.PAYMENTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment> {
    return this.request(API_ENDPOINTS.PAYMENTS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getPaymentStats(): Promise<{ totalCollected: number; pending: number; overdue: number }> {
    return this.request(API_ENDPOINTS.PAYMENTS.STATS);
  }

  // Maintenance
  async getMaintenanceRecords(filters?: { mediaId?: string; status?: string }): Promise<PaginatedResult<MaintenanceRecord>> {
    return this.request(API_ENDPOINTS.MAINTENANCE.LIST, {}, filters);
  }

  async getMaintenanceById(id: string): Promise<MaintenanceRecord> {
    return this.request(API_ENDPOINTS.MAINTENANCE.GET(id));
  }

  async createMaintenance(data: CreateMaintenanceRequest): Promise<MaintenanceRecord> {
    return this.request(API_ENDPOINTS.MAINTENANCE.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMaintenance(id: string, data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    return this.request(API_ENDPOINTS.MAINTENANCE.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async completeMaintenance(id: string): Promise<MaintenanceRecord> {
    return this.request(API_ENDPOINTS.MAINTENANCE.COMPLETE(id), { method: 'POST' });
  }

  // Contact Submissions
  async submitContact(data: ContactFormRequest): Promise<ContactSubmission> {
    return this.request(API_ENDPOINTS.CONTACT.SUBMIT, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getContactSubmissions(): Promise<PaginatedResult<ContactSubmission>> {
    return this.request(API_ENDPOINTS.CONTACT.LIST);
  }

  async updateContactStatus(id: string, status: string, notes?: string): Promise<ContactSubmission> {
    return this.request(API_ENDPOINTS.CONTACT.UPDATE_STATUS(id), {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  // Analytics
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request(API_ENDPOINTS.ANALYTICS.DASHBOARD);
  }

  async getCityLossData(): Promise<CityLossItem[]> {
    return this.request(API_ENDPOINTS.ANALYTICS.CITY_LOSS);
  }

  async getVacantSites(city: string): Promise<VacantSitesResponse> {
    return this.request(API_ENDPOINTS.ANALYTICS.VACANT_SITES(city));
  }

  async getRevenueTrend(): Promise<RevenueData[]> {
    return this.request(API_ENDPOINTS.ANALYTICS.REVENUE_TREND);
  }

  async getStateRevenue(): Promise<StateRevenueItem[]> {
    return this.request(API_ENDPOINTS.ANALYTICS.STATE_REVENUE);
  }

  async getOccupancyData(): Promise<{ mediaId: string; mediaName: string; occupancyRate: number }[]> {
    return this.request(API_ENDPOINTS.ANALYTICS.OCCUPANCY);
  }

  // File Upload
  async uploadFile(file: File, folder?: string): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.UPLOAD.FILE}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  // Compliance & Documents
  async getTenders(): Promise<PaginatedResult<TenderAgreement>> {
    return this.request('/api/compliance/tenders');
  }

  async createTender(data: Omit<TenderAgreement, 'id' | 'status'>): Promise<TenderAgreement> {
    return this.request('/api/compliance/tenders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTaxRecords(): Promise<PaginatedResult<TaxRecord>> {
    return this.request('/api/compliance/taxes');
  }

  async payTax(id: string, receiptUrl?: string): Promise<TaxRecord> {
    return this.request(`/api/compliance/taxes/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify({ receiptUrl }),
    });
  }

  async getComplianceStats(): Promise<ComplianceStats> {
    return this.request('/api/compliance/stats');
  }

  // Recycle Bin
  async getRecycleBinItems(): Promise<{ id: string; type: string; displayName: string; deletedAt: string }[]> {
    return this.request('/api/recycle-bin');
  }

  async restoreItem(id: string, type: string): Promise<void> {
    return this.request('/api/recycle-bin/restore', {
      method: 'POST',
      body: JSON.stringify({ id, type }),
    });
  }

  async permanentlyDelete(id: string, type: string): Promise<void> {
    return this.request('/api/recycle-bin/delete', {
      method: 'DELETE',
      body: JSON.stringify({ id, type }),
    });
  }
}

export const api = new SRAApi();
export default api;
