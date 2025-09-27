
 'use client';

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, AuthProvider } from "@/hooks/use-auth";
import type { User } from "@/lib/data";

function LoginContent() {
    const router = useRouter();
    const { login } = useAuth();
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
      let mounted = true;
      (async () => {
        try {
          const res = await fetch('/api/users');
          if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
          const u = await res.json();
          if (mounted) setUsers(u as User[]);
        } catch (err) {
          console.error('Failed to load users', err);
        }
      })();
      return () => { mounted = false; };
    }, []);

  const handleLogin = (userId: string | number | undefined) => {
    if (userId == null) return;
    if (login(userId as any)) {
      router.push('/dashboard');
    } else {
      alert("Login failed: User not found");
    }
  };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 font-headline">
          <Card className="w-full max-w-md border-4 border-black">
            <CardHeader className="text-center">
              <CardTitle className="text-5xl font-black tracking-tighter">PIXELATE NEST</CardTitle>
              <CardDescription className="text-lg font-bold text-muted-foreground">AGENCY CRM LOGIN</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-center text-muted-foreground">Select a user to log in as:</p>
                <div className="flex flex-col gap-4">
          {users.map((user, idx) => {
            const uid = user._id ?? user.id ?? idx;
            return (
            <Button 
              key={String(uid)}
              onClick={() => handleLogin(uid)}
              variant="outline"
              className="w-full h-16 text-xl font-bold flex justify-between items-center"
            >
              <span>{user.name}</span>
              <span className="text-sm font-normal uppercase bg-muted text-muted-foreground px-2 py-1">{user.role}</span>
            </Button>
            );
          })}
                </div>
            </CardContent>
          </Card>
        </div>
    );
}


export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginContent />
    </AuthProvider>
  );
}
