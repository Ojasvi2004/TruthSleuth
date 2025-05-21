// src/contexts/AuthContext.tsx
'use client';

import type { Dispatch, SetStateAction, ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types/user'; // Updated import

interface AuthContextType {
  user: User | null;
  login: (email: string, redirectUrl?: string) => void;
  register: (name: string, email: string, redirectUrl?: string) => void; // New register function
  updateUserProfile: (updatedUser: Partial<User>) => Promise<void>; // New update function
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
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

  const login = (email: string, redirectUrl: string = '/') => {
    // For login, we primarily use email. Name would typically come from registration.
    // If a user object with this email already exists in localStorage (e.g. from prior registration),
    // we could potentially load their name too, but for simplicity here, login creates a basic user object.
    // A real app would fetch the full user profile from a backend.
    let existingUser: User | null = null;
    try {
        const storedUser = localStorage.getItem('truthSleuthUser');
        if (storedUser) {
            const parsedUser: User = JSON.parse(storedUser);
            if (parsedUser.email === email) {
                existingUser = parsedUser;
            }
        }
    } catch (e) { /* ignore */ }
    
    const currentUser = existingUser || { email };
    setUser(currentUser);
    try {
      localStorage.setItem('truthSleuthUser', JSON.stringify(currentUser));
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
    router.push(redirectUrl);
  };

  const register = (name: string, email: string, redirectUrl: string = '/') => {
    const newUser: User = { email, name };
    setUser(newUser);
    try {
      localStorage.setItem('truthSleuthUser', JSON.stringify(newUser));
    } catch (error) {
      console.error("Failed to save user to localStorage during registration", error);
    }
    router.push(redirectUrl);
  };

  const updateUserProfile = async (updatedUser: Partial<User>): Promise<void> => {
    if (!user) throw new Error("User not logged in");
    
    const newUserProfile = { ...user, ...updatedUser };
    setUser(newUserProfile);
    try {
      localStorage.setItem('truthSleuthUser', JSON.stringify(newUserProfile));
    } catch (error) {
      console.error("Failed to save updated user profile to localStorage", error);
      // Optionally revert setUser or notify user of save failure
      throw new Error("Failed to update profile.");
    }
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
    <AuthContext.Provider value={{ user, login, register, updateUserProfile, logout, loading }}>
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
