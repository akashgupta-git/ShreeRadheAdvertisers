// API Configuration for Shree Radhe Advertisers Backend
// Backend on Render, Frontend on Hostinger, Database MongoDB Atlas

// Base URL for the backend API
// Set VITE_API_URL in your environment or .env file for production
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Check if backend is properly configured (not using placeholder)
export const isBackendConfigured = (): boolean => {
  const url = API_BASE_URL;
  return !!url && url !== 'http://localhost:5000' && !url.includes('your-backend');
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    VERIFY: '/api/auth/verify',
    CHANGE_PASSWORD: '/api/auth/change-password',
  },
  
  // Media Management
  MEDIA: {
    LIST: '/api/media',
    GET: (id: string) => `/api/media/${id}`,
    CREATE: '/api/media',
    UPDATE: (id: string) => `/api/media/${id}`,
    DELETE: (id: string) => `/api/media/${id}`,
    RESTORE: (id: string) => `/api/media/${id}/restore`,
    PUBLIC: '/api/media/public',
  },
  
  // File Upload (FTP Bridge to Hostinger)
  UPLOAD: {
    FILE: '/api/upload',
    IMAGE: '/api/upload/image',
  },
  
  // Bookings
  BOOKINGS: {
    LIST: '/api/bookings',
    GET: (id: string) => `/api/bookings/${id}`,
    CREATE: '/api/bookings',
    UPDATE: (id: string) => `/api/bookings/${id}`,
    DELETE: (id: string) => `/api/bookings/${id}`,
    BY_CUSTOMER: (customerId: string) => `/api/bookings/customer/${customerId}`,
  },
  
  // Customers
  CUSTOMERS: {
    LIST: '/api/customers',
    GET: (id: string) => `/api/customers/${id}`,
    CREATE: '/api/customers',
    UPDATE: (id: string) => `/api/customers/${id}`,
    DELETE: (id: string) => `/api/customers/${id}`,
  },
  
  // Contact Form Submissions
  CONTACT: {
    SUBMIT: '/api/contact',
    LIST: '/api/contact',
    GET: (id: string) => `/api/contact/${id}`,
    UPDATE_STATUS: (id: string) => `/api/contact/${id}/status`,
  },
  
  // Analytics & Reports
  ANALYTICS: {
    DASHBOARD: '/api/analytics/dashboard',
    REVENUE: '/api/analytics/revenue',
    OCCUPANCY: '/api/analytics/occupancy',
    TRENDS: '/api/analytics/trends',
    CITY_LOSS: '/api/analytics/city-loss',
    VACANT_SITES: (city: string) => `/api/analytics/vacant-sites/${encodeURIComponent(city)}`,
    REVENUE_TREND: '/api/analytics/revenue-trend',
    STATE_REVENUE: '/api/analytics/state-revenue',
  },
  
  // Payments
  PAYMENTS: {
    LIST: '/api/payments',
    GET: (id: string) => `/api/payments/${id}`,
    CREATE: '/api/payments',
    UPDATE: (id: string) => `/api/payments/${id}`,
    DELETE: (id: string) => `/api/payments/${id}`,
    STATS: '/api/payments/stats',
  },
  
  // Maintenance
  MAINTENANCE: {
    LIST: '/api/maintenance',
    GET: (id: string) => `/api/maintenance/${id}`,
    CREATE: '/api/maintenance',
    UPDATE: (id: string) => `/api/maintenance/${id}`,
    COMPLETE: (id: string) => `/api/maintenance/${id}/complete`,
  },
  
  // Compliance (Tenders & Taxes)
  COMPLIANCE: {
    TENDERS: '/api/compliance/tenders',
    TENDER: (id: string) => `/api/compliance/tenders/${id}`,
    TAXES: '/api/compliance/taxes',
    TAX: (id: string) => `/api/compliance/taxes/${id}`,
    STATS: '/api/compliance/stats',
  },
  
  // Recycle Bin
  RECYCLE_BIN: {
    LIST: '/api/recycle-bin',
    RESTORE: (type: string, id: string) => `/api/recycle-bin/${type}/${id}/restore`,
    PERMANENT_DELETE: (type: string, id: string) => `/api/recycle-bin/${type}/${id}`,
  },
} as const;

// Token storage keys
export const AUTH_TOKEN_KEY = 'sra_auth_token';
export const AUTH_USER_KEY = 'sra_auth_user';
