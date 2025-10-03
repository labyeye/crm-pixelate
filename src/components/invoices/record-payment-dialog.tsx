"use client";

import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

export function RecordPaymentDialog({ invoice, onRecorded }: { invoice: any; onRecorded?: () => void }) {
  const [open, setOpen] = React.useState(false);
  const form = useForm({ defaultValues: { amount: '', note: '' } });

  React.useEffect(() => {
    if (open) {
      form.reset({ amount: '', note: '' });
    }
  }, [open]);

  const handleSave = async (values: any) => {
    try {
      const amt = Number(values.amount || 0);
      if (!amt || amt <= 0) {
        alert('Enter a valid amount');
        return;
      }
      const existingPayments = Array.isArray(invoice.payments) ? invoice.payments.slice() : [];
      const newPayment = { amount: amt, note: values.note || '', date: new Date() };
      const updatedPayments = [...existingPayments, newPayment];
      const paidAmount = (Number(invoice.paidAmount || 0) + amt);
      const status = paidAmount >= Number(invoice.amount || 0) ? 'PAID' : 'PARTIAL';

      const res = await fetch(`/api/invoices/${invoice._id ?? invoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payments: updatedPayments, paidAmount, status }),
      });
      if (!res.ok) throw new Error('Failed to record payment');
      setOpen(false);
      if (onRecorded) onRecorded();
    } catch (e) {
      console.error('Record payment failed', e);
      alert('Failed to record payment');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Record payment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            <FormField name="amount" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (₹)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" />
                </FormControl>
              </FormItem>
            )} />

            <FormField name="note" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="submit" size="lg" className="w-full">Save Payment</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default RecordPaymentDialog;
