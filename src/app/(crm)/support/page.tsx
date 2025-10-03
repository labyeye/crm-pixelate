"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';

type Ticket = any;

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/support-tickets');
        if (!res.ok) throw new Error(`Failed to fetch support tickets: ${res.status}`);
        const t = await res.json();
        if (mounted) setTickets(t as Ticket[]);
      } catch (err) {
        console.error('Failed to load support tickets', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-8 font-headline">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">SUPPORT</h1>
          <p className="text-muted-foreground text-lg">Client tickets and maintenance requests.</p>
        </div>
        <Button size="lg" className="text-lg">New Ticket</Button>
      </header>
      
      <div className="border-2 border-black">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-black">
              <TableHead className="text-base font-bold">Ticket</TableHead>
              <TableHead className="text-base font-bold">Client</TableHead>
              <TableHead className="text-base font-bold">Priority</TableHead>
              <TableHead className="text-base font-bold">SLA</TableHead>
              <TableHead className="text-right text-base font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id} className="border-b-2 border-black last:border-b-0">
                <TableCell className="font-bold text-lg py-5">{ticket.title}</TableCell>
                <TableCell className="text-base text-muted-foreground py-5">{ticket.client}</TableCell>
                <TableCell className="py-5">
                   <span className={cn("p-2 font-bold", 
                    ticket.priority === 'High' && 'bg-destructive text-destructive-foreground',
                    ticket.priority === 'Medium' && 'bg-accent text-accent-foreground',
                    ticket.priority === 'Low' && 'bg-muted text-muted-foreground'
                   )}>
                    {ticket.priority}
                   </span>
                </TableCell>
                <TableCell className={cn("font-black text-base py-5", (ticket.sla ?? '').includes('PASSED') && 'text-destructive')}>
                    {ticket.sla === 'DEADLINE PASSED' ? 
                        <span className="bg-foreground text-background p-2">{ticket.sla}</span> : 
                        ticket.sla
                    }
                </TableCell>
                <TableCell className="text-right font-bold text-base py-5">{ticket.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
