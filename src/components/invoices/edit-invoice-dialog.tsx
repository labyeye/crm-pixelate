"use client";

import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

export function EditInvoiceDialog({ invoice, clients, services, projects, onUpdated }: { invoice: any; clients: any[]; services: any[]; projects: any[]; onUpdated?: () => void }) {
  const [open, setOpen] = React.useState(false);
  const form = useForm({ defaultValues: { clientId: '', projectTitle: '', title: '', amount: 0, dueDate: '', serviceId: '', status: '' } });

  React.useEffect(() => {
    if (open && invoice) {
      form.reset({
        clientId: String(invoice.clientId ?? invoice.client ?? invoice.clientName ?? ''),
        projectTitle: invoice.projectTitle ?? invoice.title ?? '',
        title: invoice.title ?? invoice.projectTitle ?? '',
        amount: invoice.amount ?? 0,
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().slice(0, 10) : '',
        serviceId: String(invoice.serviceId ?? ''),
        status: invoice.status ?? 'DUE',
      });
    }
  }, [open, invoice]);

  const handleSave = async (values: any) => {
    try {
      const body = {
        clientId: values.clientId || null,
        clientName: clients.find(c => String(c.id ?? c._id) === String(values.clientId))?.name || '',
        projectTitle: values.projectTitle || values.title || '',
        title: values.title || values.projectTitle || 'Invoice',
        amount: Number(values.amount || 0),
        dueDate: values.dueDate || '',
        serviceId: values.serviceId || null,
        status: values.status || 'DUE',
      };

      const res = await fetch(`/api/invoices/${invoice._id ?? invoice.id}`, { method: 'PUT', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Failed to update invoice');
      setOpen(false);
      if (onUpdated) onUpdated();
    } catch (e) {
      console.error('Failed to save invoice', e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="status" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full border p-2">
                      <option value="DUE">DUE</option>
                      <option value="PAID">PAID</option>
                      <option value="OVERDUE">OVERDUE</option>
                    </select>
                  </FormControl>
                </FormItem>
              )} />
            </div>

            <DialogFooter>
              <Button type="submit" size="lg" className="w-full">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default EditInvoiceDialog;
