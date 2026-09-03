/**
 * AuthContext — Frontend mock authentication foundation.
 *
 * Architecture Note:
 * This is a FRONTEND MOCK. Credentials are not actually validated against a backend.
 * Session is persisted to localStorage via a safe mock-session key.
 * In production: replace mockAuthService calls with real API calls and use
 * HTTP-only cookies or secure token storage instead of localStorage.
 *
 * DO NOT store real passwords here. The mock OTP/password is for demo only.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockAuthService } from '@/services/auth';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithOTP: (phone: string, otp: string) => Promise<void>;
  signup: (data: { name: string; email: string; phone?: string; password: string }) => Promise<void>;
  logout: () => void;
}

const SESSION_KEY = 'globetrotter_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed: AuthUser = JSON.parse(raw);
        if (parsed?.id) setUser(parsed);
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const persistUser = (u: AuthUser) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    setUser(u);
  };

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    const u = await mockAuthService.loginWithEmail(email, password);
    persistUser(u);
  }, []);

  const loginWithOTP = useCallback(async (phone: string, otp: string) => {
    const u = await mockAuthService.loginWithPhoneOTP(phone, otp);
    persistUser(u);
  }, []);

  const signup = useCallback(async (data: { name: string; email: string; phone?: string; password: string }) => {
    const u = await mockAuthService.signup(data);
    persistUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      loginWithEmail,
      loginWithOTP,
      signup,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
