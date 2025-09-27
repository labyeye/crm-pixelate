import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';

type Invoice = any;

export default function InvoicingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/invoices');
        if (!res.ok) throw new Error(`Failed to fetch invoices: ${res.status}`);
        const list = await res.json();
        if (mounted) setInvoices(list as Invoice[]);
      } catch (err) {
        console.error('Failed to load invoices', err);
      }
    })();
    return () => { mounted = false; };
  }, []);
  return (
    <div className="space-y-8 font-headline">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">INVOICING</h1>
          <p className="text-muted-foreground text-lg">Manage and track all client invoices.</p>
        </div>
        <Button size="lg" className="text-lg">New Invoice</Button>
      </header>

      <div className="border-2 border-black">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-black">
              <TableHead className="text-base font-bold">Invoice ID</TableHead>
              <TableHead className="text-base font-bold">Client</TableHead>
              <TableHead className="text-base font-bold">Amount</TableHead>
              <TableHead className="text-base font-bold">Due Date</TableHead>
              <TableHead className="text-right text-base font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id} className="border-b-2 border-black last:border-b-0">
                <TableCell className="font-bold text-base py-4">{invoice.id}</TableCell>
                <TableCell className="text-base py-4">{invoice.client}</TableCell>
                <TableCell className="text-base py-4">₹{(invoice.amount ?? 0).toLocaleString()}</TableCell>
                <TableCell className="text-base py-4">{invoice.dueDate ?? ''}</TableCell>
                <TableCell className="text-right py-4">
                  <span className={cn(
                    "text-xl font-black tracking-widest p-2",
                    invoice.status === 'PAID' && 'bg-success text-success-foreground',
                    invoice.status === 'DUE' && 'bg-destructive text-destructive-foreground',
                    invoice.status === 'OVERDUE' && 'bg-accent text-accent-foreground',
                  )}>
                    {invoice.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
