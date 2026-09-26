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
  logout: () => void;
  isAdmin: boolean;
  isTechnician: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  loginAs: () => {},
  loginWithEmail: async () => false,
  logout: () => {},
  isAdmin: false,
  isTechnician: false,
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
          setUser(JSON.parse(saved));
        } else {
          // Default to Admin for seamless initial onboarding
          setUser(INITIAL_USERS[0]);
          localStorage.setItem('nailed_it_auth_user', JSON.stringify(INITIAL_USERS[0]));
        }
      } catch (e) {
        setUser(INITIAL_USERS[0]);
      }
    }
    setLoading(false);
  }, []);

  const loginAs = (role: UserRole) => {
    const target = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    setUser(target);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nailed_it_auth_user', JSON.stringify(target));
    }
  };

  const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    // Check against mock users or create session
    const matched = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setUser(matched);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nailed_it_auth_user', JSON.stringify(matched));
      }
      return true;
    } else {
      // Create user profile on the fly
      const isTech = email.includes('tech');
      const newUser: UserProfile = {
        uid: `user-${Date.now()}`,
        email,
        displayName: email.split('@')[0],
        role: isTech ? 'technician' : 'admin',
        active: true,
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nailed_it_auth_user', JSON.stringify(newUser));
      }
      return true;
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nailed_it_auth_user');
    }
  };

  const role = user?.role || null;
  const isAdmin = role === 'admin' || role === 'dispatcher';
  const isTechnician = role === 'technician';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role,
        loginAs,
        loginWithEmail,
        logout,
        isAdmin,
        isTechnician,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
