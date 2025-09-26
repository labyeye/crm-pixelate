
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Code, Users, LayoutDashboard, KanbanSquare, FileText, Briefcase, Receipt, LifeBuoy, Columns } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', adminOnly: false, icon: LayoutDashboard },
  { href: '/timeline', label: 'Timeline', adminOnly: false, icon: Columns },
  { href: '/leads', label: 'Leads', adminOnly: false, icon: KanbanSquare },
  { href: '/clients', label: 'Clients', adminOnly: false, icon: Users },
  { href: '/quotations', label: 'Quotations', adminOnly: false, icon: FileText },
  { href: '/projects', label: 'Projects', adminOnly: false, icon: Briefcase },
  { href: '/invoicing', label: 'Invoicing', adminOnly: true, icon: Receipt },
  { href: '/developers-and-editors', label: 'Developers & Editors', adminOnly: true, icon: Users },
  { href: '/services', label: 'Services', adminOnly: true, icon: Code },
  { href: '/support', label: 'Support', adminOnly: false, icon: LifeBuoy },
];


function NavLinks({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <>
      {navItems.map((item) => (
         (item.adminOnly && !isAdmin) ? null : (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
            className={cn(
              "flex items-center gap-4 rounded-none border-2 border-foreground p-3 text-base font-bold transition-colors",
              pathname.startsWith(item.href)
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-foreground hover:bg-foreground hover:text-background'
            )}
          >
            {item.icon && <item.icon />}
            {item.label}
          </Link>
        )
      ))}
    </>
  );
}

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push('/login');
  }

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b-2 border-black bg-background px-4 md:hidden">
            <Link href="/dashboard" className="text-xl font-bold tracking-tighter">
                PN CRM
            </Link>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-10 w-10">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-xs p-0 border-r-2 border-black bg-background">
                   <div className="flex h-full flex-col">
                      <div className="p-6 border-b-2 border-black">
                        <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                          <h1 className="text-2xl font-bold tracking-tighter">Pixelate Nest</h1>
                          <p className="text-sm text-muted-foreground">Creative Agency CRM</p>
                        </Link>
                      </div>
                      <nav className="flex-1 p-6 space-y-2">
                        <NavLinks onLinkClick={() => setIsOpen(false)} />
                      </nav>
                      <div className="p-6 border-t-2 border-black">
                        <Button variant="outline" className="w-full" onClick={handleLogout}>Logout</Button>
                      </div>
                    </div>
                </SheetContent>
            </Sheet>
        </header>
    )
}
