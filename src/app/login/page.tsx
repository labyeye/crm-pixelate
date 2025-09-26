
'use client';

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { users } from "@/lib/data";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    const handleLogin = (userId: number) => {
        if (login(userId)) {
            router.push('/dashboard');
        } else {
            // Handle failed login, e.g., show an error message
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
                {users.map(user => (
                    <Button 
                        key={user.id}
                        onClick={() => handleLogin(user.id)}
                        variant="outline"
                        className="w-full h-16 text-xl font-bold flex justify-between items-center"
                    >
                        <span>{user.name}</span>
                        <span className="text-sm font-normal uppercase bg-muted text-muted-foreground px-2 py-1">{user.role}</span>
                    </Button>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
