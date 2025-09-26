
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { users, User } from '@/lib/data';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (userId: number) => boolean;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define public routes that don't require authentication
const publicRoutes = ['/login'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUserId = sessionStorage.getItem('userId');
    if (storedUserId) {
      const foundUser = users.find(u => u.id === parseInt(storedUserId, 10));
      if (foundUser) {
        setUser(foundUser);
      } else {
        sessionStorage.removeItem('userId');
        if (!publicRoutes.includes(pathname)) {
            router.push('/login');
        }
      }
    } else {
        if (!publicRoutes.includes(pathname)) {
            router.push('/login');
        }
    }
    setLoading(false);
  }, [router, pathname]);

  const login = (userId: number) => {
    const foundUser = users.find(u => u.id === userId);
    if (foundUser) {
      setUser(foundUser);
      sessionStorage.setItem('userId', String(userId));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('userId');
  };
  
  if (loading) {
    return null; 
  }

  // If not authenticated and trying to access a protected route, redirect to login.
  if (!user && !publicRoutes.includes(pathname) && pathname !== '/') {
      // This is a safeguard. The useEffect should handle redirection.
      // But if it renders before effect runs, this can prevent flashing protected content.
      return null;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
