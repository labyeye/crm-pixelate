
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/lib/data';
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
    let mounted = true;
    (async () => {
      try {
        const storedUserId = sessionStorage.getItem('userId');
        // fetch users from the API instead of importing server-only modules
        const res = await fetch('/api/users');
        const allUsers = (await res.json()) as User[];
        if (!mounted) return;
        if (storedUserId) {
          const foundUser = allUsers.find(u => (u.id ?? (u._id as any)) === (isNaN(Number(storedUserId)) ? storedUserId : Number(storedUserId)));
          if (foundUser) {
            setUser(foundUser);
          } else {
            sessionStorage.removeItem('userId');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("Could not access users or session storage.", e);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [pathname]); // Re-check on path change could be useful

  useEffect(() => {
    if (!loading) {
        const isPublic = publicRoutes.includes(pathname);
        if (!user && !isPublic) {
            router.push('/login');
        }
    }
  }, [loading, user, pathname, router]);

  const login = (userId: string | number) => {
    // synchronous behavior retained: set the id in sessionStorage and rely on the
    // next checkUser cycle to refresh the user. We optimistically set the user
    // if the list is already loaded.
  sessionStorage.setItem('userId', String(userId));
    // Try to find user in currently loaded list (fast path)
    // Note: getUsers() is async so we don't await here to keep login sync.
    // If the user isn't loaded yet, the effect will pick them up.
    (async () => {
      try {
        const res = await fetch('/api/users');
        const allUsers = (await res.json()) as User[];
        const normalized = allUsers.find(u => {
          const candidate = u.id ?? (u._id as any);
          // compare strings and numbers equivalently
          return String(candidate) === String(userId);
        });
        if (normalized) setUser(normalized);
      } catch (e) {
        // ignore
      }
    })();
    return true;
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
