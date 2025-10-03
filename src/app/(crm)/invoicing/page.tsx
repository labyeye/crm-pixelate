"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';
import { AddInvoiceDialog } from '@/components/invoices/add-invoice-dialog';
import EditInvoiceDialog from '@/components/invoices/edit-invoice-dialog';
import RecordPaymentDialog from '@/components/invoices/record-payment-dialog';

type Invoice = any;

export default function InvoicingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

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
    (async () => {
      try {
        const [cRes, sRes, pRes] = await Promise.all([fetch('/api/clients'), fetch('/api/services'), fetch('/api/projects')]);
        const [cJson, sJson, pJson] = await Promise.all([cRes.json(), sRes.json(), pRes.json()]);
        if (mounted) {
          setClients(cJson || []);
          setServices(sJson || []);
          setProjects(pJson || []);
        }
      } catch (e) { console.error('Failed to load invoice helpers', e); }
    })();
    return () => { mounted = false; };
  }, []);
  const refresh = async () => {
    try {
      const res = await fetch('/api/invoices');
      if (!res.ok) throw new Error('Failed to fetch invoices');
      const list = await res.json();
      setInvoices(list as Invoice[]);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-8 font-headline">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">INVOICING</h1>
          <p className="text-muted-foreground text-lg">Manage and track all client invoices.</p>
        </div>
        <AddInvoiceDialog clients={clients} services={services} projects={projects} onCreated={refresh} />
      </header>

      <div className="border-2 border-black">
        <Table>
          <TableHeader>
              <TableRow className="border-b-2 border-black">
              <TableHead className="text-base font-bold">Invoice ID</TableHead>
              <TableHead className="text-base font-bold">Client</TableHead>
              <TableHead className="text-base font-bold">Project / Title</TableHead>
              <TableHead className="text-base font-bold">Amount</TableHead>
              <TableHead className="text-base font-bold">Paid</TableHead>
              <TableHead className="text-base font-bold">Due Date</TableHead>
              <TableHead className="text-right text-base font-bold">Status</TableHead>
              <TableHead className="text-right text-base font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice._id ?? invoice.id} className="border-b-2 border-black last:border-b-0">
                <TableCell className="font-bold text-base py-4">{invoice._id ?? invoice.id}</TableCell>
                <TableCell className="text-base py-4">{invoice.clientName || invoice.client || (clients.find(c => String(c.id ?? c._id) === String(invoice.clientId))?.name) || '-'}</TableCell>
                <TableCell className="text-base py-4">{invoice.title ?? invoice.projectTitle ?? '-'}</TableCell>
                <TableCell className="text-base py-4">₹{(invoice.amount ?? 0).toLocaleString()}</TableCell>
                <TableCell className="text-base py-4">₹{(invoice.paidAmount ?? 0).toLocaleString()}</TableCell>
                <TableCell className="text-base py-4">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ''}</TableCell>
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
                <TableCell className="text-right py-4">
                  <div className="flex items-center justify-end gap-2">
                    <EditInvoiceDialog invoice={invoice} clients={clients} services={services} projects={projects} onUpdated={refresh} />
                    <RecordPaymentDialog invoice={invoice} onRecorded={refresh} />
                    <Button size="sm" variant="destructive" onClick={async () => {
                      if (!confirm('Delete this invoice?')) return;
                      try {
                        const res = await fetch(`/api/invoices/${invoice._id ?? invoice.id}`, { method: 'DELETE' });
                        if (!res.ok) throw new Error('Delete failed');
                        await refresh();
                      } catch (err) { console.error(err); }
                    }}>Delete</Button>
                    {invoice.status !== 'PAID' && (
                      <Button size="sm" className="bg-green-600 text-white" onClick={async () => {
                        try {
                          // optimistic update
                          setInvoices((prev) => prev.map((inv) => (inv._id === invoice._id || inv.id === invoice.id ? { ...inv, status: 'PAID' } : inv)));
                          const res = await fetch(`/api/invoices/${invoice._id ?? invoice.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'PAID' }) });
                          if (!res.ok) throw new Error('Failed to mark paid');
                          await refresh();
                        } catch (err) {
                          console.error('Failed to mark invoice as paid', err);
                          await refresh();
                        }
                      }}>Mark received</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
