'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Lead } from '@/lib/data';

const leadStatuses: ('NEW' | 'QUALIFIED' | 'PROPOSAL SENT')[] = ['NEW', 'QUALIFIED', 'PROPOSAL SENT'];
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/leads');
        const items = await res.json();
        if (mounted) setLeads(items as Lead[]);
      } catch (err) {
        console.error('Failed to load leads', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const updateLeadStatus = (leadId: number | undefined, newStatus: Lead['status']) => {
    if (leadId == null) return;
    setLeads(leads.map(lead => lead.id === leadId ? { ...lead, status: newStatus } : lead));
  };

  return (
    <div className="space-y-8 font-headline">
      <header>
        <h1 className="text-5xl font-black tracking-tighter">LEAD MANAGEMENT</h1>
        <p className="text-muted-foreground text-lg">Track and manage potential clients from new to closed.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {leadStatuses.map(status => (
          <div key={status} className="space-y-4">
            <h2 className="text-2xl font-black tracking-tighter p-2 border-2 border-black bg-muted text-center">
              {status}
            </h2>
            <div className="space-y-4">
              {leads.filter(lead => lead.status === status).map(lead => (
                <Card key={lead.id} className="border-4 border-black bg-white group">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-bold tracking-tight">{lead.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {leadStatuses.filter(s => s !== lead.status).map(newStatus => (
                          <DropdownMenuItem key={newStatus} onClick={() => updateLeadStatus(lead.id, newStatus)} className="font-bold">
                            Move to {newStatus}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{lead.project}</p>
                    <p className="mt-4 text-2xl font-black">₹{(lead.value ?? 0).toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
