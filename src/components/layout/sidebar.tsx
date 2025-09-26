'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/leads', label: 'Leads' },
  { href: '/quotations', label: 'Quotations' },
  { href: '/projects', label: 'Projects' },
  { href: '/invoicing', label: 'Invoicing' },
  { href: '/support', label: 'Support' },
];

const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1');

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 lg:w-72 flex-col fixed inset-y-0 z-10 border-r-2 border-black bg-background">
      <div className="p-6 border-b-2 border-black">
        <Link href="/dashboard" className="block group">
          <h1 className="text-2xl font-bold tracking-tighter group-hover:text-primary">Pixelate Nest</h1>
          <p className="text-sm text-muted-foreground">Creative Agency CRM</p>
        </Link>
      </div>
      <nav className="flex-1 p-6 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-none border-2 border-foreground p-3 text-base font-bold transition-colors",
              pathname.startsWith(item.href)
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-foreground hover:bg-foreground hover:text-background'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-6 border-t-2 border-black">
        <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-black rounded-none">
                {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" />}
                <AvatarFallback className="rounded-none bg-accent text-accent-foreground font-bold">AU</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-bold">Admin User</p>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-primary underline">
                  Logout
                </Link>
            </div>
        </div>
      </div>
    </aside>
  );
}
