
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
    const checkUser = () => {
      try {
        const storedUserId = sessionStorage.getItem('userId');
        if (storedUserId) {
          const foundUser = users.find(u => u.id === parseInt(storedUserId, 10));
          if (foundUser) {
            setUser(foundUser);
          } else {
            // Clear invalid user id from storage
            sessionStorage.removeItem('userId');
            setUser(null);
          }
        } else {
            setUser(null);
        }
      } catch (e) {
        console.error("Could not access session storage.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, [pathname]); // Re-check on path change could be useful

  useEffect(() => {
    if (!loading) {
        const isPublic = publicRoutes.includes(pathname);
        if (!user && !isPublic) {
            router.push('/login');
        }
    }
  }, [loading, user, pathname, router]);

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
    router.push('/login');
  };
  
  if (loading) {
    return null; // Don't render anything until client-side check is complete
  }

  if (!user && !publicRoutes.includes(pathname)) {
    // While redirecting, render nothing to prevent flashing of content
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading: loading }}>
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
