// Authentication Context for Shree Radhe Advertisers Admin
// Handles JWT authentication with the backend on Render

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS, AUTH_TOKEN_KEY, AUTH_USER_KEY } from '@/lib/api/config';
import type { AdminUser, AuthResponse, LoginRequest } from '@/lib/api/types';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  const checkAuth = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedUser = localStorage.getItem(AUTH_USER_KEY);

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return false;
    }

    try {
      // Verify token with backend
      const response = await apiClient.get<{ success: boolean; user: AdminUser }>(
        API_ENDPOINTS.AUTH.VERIFY
      );

      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
        return true;
      } else {
        // Token invalid
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
        setUser(null);
        return false;
      }
    } catch {
      // If verification fails, try to use stored user data
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          return true;
        } catch {
          // Invalid stored user data
        }
      }
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Listen for unauthorized events from API client
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      if (response.success && response.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, response.token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
        setUser(response.user);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    // Call logout endpoint
    apiClient.post(API_ENDPOINTS.AUTH.LOGOUT).catch(() => {
      // Ignore errors on logout
    });
    
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
