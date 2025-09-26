
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth } from '@/hooks/use-auth';
import { Code, Users, LayoutDashboard, KanbanSquare, FileText, Briefcase, Receipt, LifeBuoy, Columns } from 'lucide-react';

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

const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1');

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) {
    // This case should be handled by the AuthProvider's loading state,
    // but as a fallback, we render an empty sidebar.
    return (
        <aside className="hidden md:flex md:w-60 lg:w-72 flex-col fixed inset-y-0 z-10 border-r-2 border-black bg-background">
        </aside>
    );
  }
  
  const isAdmin = user?.role === 'admin';

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
          (item.adminOnly && !isAdmin) ? null : (
            <Link
              key={item.href}
              href={item.href}
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
      </nav>
      <div className="p-6 border-t-2 border-black">
        <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-black rounded-none">
                {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" />}
                <AvatarFallback className="rounded-none bg-accent text-accent-foreground font-bold">
                    {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                </AvatarFallback>
            </Avatar>
            <div>
                <p className="font-bold">{user.name}</p>
                <p className="text-sm text-muted-foreground uppercase">{user.role}</p>
                 <button onClick={logout} className="text-sm text-muted-foreground hover:text-primary underline">
                  Logout
                </button>
            </div>
        </div>
      </div>
    </aside>
  );
}
