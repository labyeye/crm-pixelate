import { Sidebar } from '@/components/layout/sidebar';
import { MobileHeader } from '@/components/layout/header';

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <Sidebar />
      <div className="md:pl-60 lg:pl-72">
        <MobileHeader />
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
