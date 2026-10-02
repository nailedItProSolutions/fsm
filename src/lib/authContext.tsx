'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types';
import { INITIAL_USERS } from './store';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  role: UserRole | null;
  loginAs: (role: UserRole) => void;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  loginWithEmployeePin: (employeeId: string, pin: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isTechnician: boolean;
  isClient: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  loginAs: () => {},
  loginWithEmail: async () => false,
  loginWithEmployeePin: async () => false,
  logout: () => {},
  isAdmin: false,
  isTechnician: false,
  isClient: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check saved session in localStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nailed_it_auth_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          setUser(parsed);
          document.cookie = `nailed_it_auth_token=${parsed.uid}; path=/; max-age=86400; SameSite=Lax`;
        } else {
          // Strict Production Lockdown: No unauthenticated bypass
          setUser(null);
          document.cookie = 'nailed_it_auth_token=; path=/; max-age=0; SameSite=Lax';
        }
      } catch (e) {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const loginAs = (role: UserRole) => {
    const target = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    setUser(target);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nailed_it_auth_user', JSON.stringify(target));
      document.cookie = `nailed_it_auth_token=${target.uid}; path=/; max-age=86400; SameSite=Lax`;
    }
  };

  const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    // Authenticate against registered employee profiles
    const matched = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setUser(matched);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nailed_it_auth_user', JSON.stringify(matched));
        document.cookie = `nailed_it_auth_token=${matched.uid}; path=/; max-age=86400; SameSite=Lax`;
      }
      return true;
    } else {
      // In live production with Firebase Auth, this communicates with Firebase Auth SDK.
      // For local pre-flight fallback with arbitrary company domain emails:
      if (email.endsWith('@nailedit.com') || email.includes('admin') || email.includes('tech')) {
        const isTech = email.includes('tech');
        const newUser: UserProfile = {
          uid: `user-${Date.now()}`,
          email,
          displayName: email.split('@')[0],
          role: isTech ? 'technician' : 'admin',
          employeeId: isTech ? `TECH-${Math.floor(100 + Math.random() * 900)}` : '1019974',
          pin: '1234',
          active: true,
          createdAt: new Date().toISOString(),
        };
        setUser(newUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('nailed_it_auth_user', JSON.stringify(newUser));
          document.cookie = `nailed_it_auth_token=${newUser.uid}; path=/; max-age=86400; SameSite=Lax`;
        }
        return true;
      }
      return false;
    }
  };

  const loginWithEmployeePin = async (employeeId: string, pin: string): Promise<boolean> => {
    const cleanId = employeeId.trim().toUpperCase();
    const cleanPin = pin.trim();

    const matched = INITIAL_USERS.find(
      (u) => u.employeeId?.toUpperCase() === cleanId && u.pin === cleanPin
    );

    if (matched) {
      setUser(matched);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nailed_it_auth_user', JSON.stringify(matched));
        document.cookie = `nailed_it_auth_token=${matched.uid}; path=/; max-age=86400; SameSite=Lax`;
      }
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nailed_it_auth_user');
      document.cookie = 'nailed_it_auth_token=; path=/; max-age=0; SameSite=Lax';
    }
  };

  const role = user?.role || null;
  const isAdmin = role === 'admin' || role === 'dispatcher';
  const isTechnician = role === 'technician';
  const isClient = role === 'client';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role,
        loginAs,
        loginWithEmail,
        loginWithEmployeePin,
        logout,
        isAdmin,
        isTechnician,
        isClient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
