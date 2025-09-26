import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 font-headline">
      <Card className="w-full max-w-md border-4 border-black">
        <CardHeader className="text-center">
          <CardTitle className="text-5xl font-black tracking-tighter">PIXELATE NEST</CardTitle>
          <CardDescription className="text-lg font-bold text-muted-foreground">AGENCY CRM LOGIN</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-bold">EMAIL</Label>
            <Input id="email" type="email" placeholder="your@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-base font-bold">PASSWORD</Label>
            <Input id="password" type="password" placeholder="••••••••" required />
          </div>
          <Link href="/dashboard">
            <Button type="submit" className="w-full h-14 text-xl font-bold">
              LOG IN
            </Button>
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            This is a demo. <Link href="/dashboard" className="underline font-bold hover:text-primary">Click here to continue</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
