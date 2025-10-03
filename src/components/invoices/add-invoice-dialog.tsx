"use client";

import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Client, Service } from '@/lib/data';
import { InvoicePDF } from './invoice-pdf';
import jsPDF from 'jspdf';
import { renderToString } from 'react-dom/server';

export function AddInvoiceDialog({ clients, services, projects, onCreated }: { clients: Client[]; services: Service[]; projects: any[]; onCreated?: () => void }) {
  const [open, setOpen] = React.useState(false);
  const form = useForm({ defaultValues: { clientId: '', serviceId: '', projectTitle: '', title: '', amount: 0, dueDate: '' } });

  const handleSave = async (values: any) => {
    try {
      const invoice = {
        clientId: values.clientId || null,
        clientName: clients.find(c => String(c.id ?? c._id) === String(values.clientId))?.name || '',
        serviceId: values.serviceId || null,
        projectTitle: values.projectTitle || values.title || '',
        title: values.title || values.projectTitle || 'Invoice',
        amount: Number(values.amount || 0),
        dueDate: values.dueDate || '',
        status: 'DUE',
        createdAt: new Date()
      };
      const res = await fetch('/api/invoices', { method: 'POST', body: JSON.stringify(invoice), headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Failed to create invoice');
      const created = await res.json();

      // generate PDF and download
      const doc = new jsPDF();
      const pdfContent = renderToString(<InvoicePDF invoice={{ ...created, ...invoice }} />);
      doc.html(pdfContent, {
        callback: function (doc) { doc.save(`Invoice-${created._id ?? created.id}.pdf`); },
        x: 10, y: 10, width: 180, windowWidth: 800
      });

      setOpen(false);
      form.reset();
      if (onCreated) onCreated();
    } catch (e) { console.error(e); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" onClick={() => setOpen(true)}>New Invoice</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="clientId" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full border p-2">
                      <option value="">Select client</option>
                      {clients.map(c => <option key={String(c.id ?? c._id)} value={String(c.id ?? c._id)}>{c.name}</option>)}
                    </select>
                  </FormControl>
                </FormItem>
              )} />

              <FormField name="projectTitle" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )} />

              <FormField name="title" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )} />

              <FormField name="amount" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )} />

            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="dueDate" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )} />

              <FormField name="serviceId" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full border p-2">
                      <option value="">Select service</option>
                      {services.map(s => <option key={String(s.id ?? s._id)} value={String(s.id ?? s._id)}>{s.name}</option>)}
                    </select>
                  </FormControl>
                </FormItem>
              )} />
            </div>

            <DialogFooter>
              <Button type="submit" size="lg" className="w-full">Create & Download PDF</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
