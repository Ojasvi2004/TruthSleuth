// src/contexts/AuthContext.tsx
'use client';

import type { Dispatch, SetStateAction, ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Try to load user from localStorage
    try {
      const storedUser = localStorage.getItem('truthSleuthUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('truthSleuthUser');
    }
    setLoading(false);
  }, []);

  const login = (email: string) => {
    const newUser = { email };
    setUser(newUser);
    try {
      localStorage.setItem('truthSleuthUser', JSON.stringify(newUser));
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
    router.push('/');
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('truthSleuthUser');
    } catch (error) {
      console.error("Failed to remove user from localStorage", error);
    }
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
