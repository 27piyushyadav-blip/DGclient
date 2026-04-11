'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { expertAuthService, AuthResponse } from '@/lib/expertAuth';

interface ExpertUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface AuthContextType {
  user: ExpertUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  googleLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'client_access_token';
const REFRESH_TOKEN_KEY = 'client_refresh_token';
const USER_KEY = 'client_user';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<ExpertUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!accessToken && !!user;

  // Load tokens and user from localStorage on mount
  useEffect(() => {
    const loadAuthData = () => {
      try {
        const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedAccessToken && storedRefreshToken && storedUser) {
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  // Auto-refresh token before it expires (every 50 minutes)
  useEffect(() => {
    if (!accessToken || !refreshToken) return;

    const refreshInterval = setInterval(async () => {
      try {
        console.log('Proactively refreshing access token...');
        await refreshAccessToken();
      } catch (error) {
        console.error('Auto refresh failed:', error);
        clearAuthData();
      }
    }, 12 * 60 * 1000); // 12 minutes

    return () => clearInterval(refreshInterval);
  }, [accessToken, refreshToken]);

  const clearAuthData = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  };

  const setAuthData = (authResponse: AuthResponse, userData?: ExpertUser) => {
    setAccessToken(authResponse.access_token);
    setRefreshToken(authResponse.refresh_token);
    
    localStorage.setItem(ACCESS_TOKEN_KEY, authResponse.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, authResponse.refresh_token);
    
    if (userData) {
      setUser(userData);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    }
  };

  const login = async (identifier: string, password: string) => {
    try {
      const authResponse = await expertAuthService.login({ identifier, password });
      
      // Create a basic user object from the identifier (email)
      // In a real implementation, you might want to fetch user details from a /me endpoint
      const userData: ExpertUser = {
        id: '', // This would come from the API
        name: identifier.split('@')[0], // Temporary, would come from API
        email: identifier,
        image: null,
      };
      
      setAuthData(authResponse, userData);
    } catch (error) {
      clearAuthData();
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      await expertAuthService.register({ name, email, password });
      // Registration doesn't return tokens, user needs to verify email first
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await expertAuthService.logout(accessToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
    }
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const authResponse = await expertAuthService.refreshToken(refreshToken);
      setAuthData(authResponse, user || undefined);
    } catch (error) {
      clearAuthData();
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    await expertAuthService.forgotPassword(email);
  };

  const resetPassword = async (token: string, password: string) => {
    await expertAuthService.resetPassword(token, password);
  };

  const verifyEmail = async (token: string) => {
    await expertAuthService.verifyEmail(token);
  };

  const googleLogin = () => {
    expertAuthService.googleLogin();
  };

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshAccessToken,
    forgotPassword,
    resetPassword,
    verifyEmail,
    googleLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook to get authorization header for API calls
export function useAuthHeader() {
  const { accessToken } = useAuth();
  
  return {
    Authorization: accessToken ? `Bearer ${accessToken}` : '',
  };
}
