'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandGroup, CommandInput, CommandItem, CommandEmpty } from '@/components/ui/command';
import { Check } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const schema = z.object({
  title: z.string().min(2),
  clientId: z.string().min(1),
  services: z.array(z.object({ id: z.string(), name: z.string(), amount: z.number().min(0).optional() })).min(1),
  deliveryDate: z.date(),
  workUrl: z.string().url().optional(),
  brandLogo: z.string().optional(),
  amount: z.number().min(0),
  progress: z.number().min(0).max(100).optional(),
  assignees: z.array(z.object({ id: z.union([z.string(), z.number()]), payout: z.number().min(0) })).optional(),
});

export type AddProjectFormProps = {
  clients: any[];
  services: any[];
  teamMembers: any[];
  onCreate?: (project: any) => void;
  initialValues?: any;
  editingId?: string | null;
};

export default function AddProjectForm({ clients, services, teamMembers, onCreate, initialValues, editingId }: AddProjectFormProps) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      clientId: '',
      services: [],
      deliveryDate: undefined as any,
      workUrl: '',
      assignees: [],
      amount: 0,
        progress: 0,
      brandLogo: undefined as any,
    },
  });

  React.useEffect(() => {
    if (initialValues) {
      // map incoming project shape to form defaults (normalize ids)
      const mapped = {
        title: initialValues.title || '',
        clientId: initialValues.clientId ? String(initialValues.clientId) : (initialValues.client ? initialValues.client : ''),
        services: (initialValues.services || []).map((s:any) => ({ id: String(s.id ?? s._id ?? s), name: s.name ?? s.title ?? '', amount: s.amount ?? 0 })),
        deliveryDate: initialValues.deliveryDate ? new Date(initialValues.deliveryDate) : undefined,
        workUrl: initialValues.workUrl || '',
        amount: initialValues.amount ?? 0,
        progress: initialValues.progress ?? 0,
        assignees: (initialValues.assignees || []).map((a:any) => ({ id: a.id ?? a, payout: a.payout ?? a.payout ?? 0 })),
        brandLogo: initialValues.brandLogo ?? initialValues.logo ?? undefined,
      };
      form.reset(mapped);
    }
  }, [initialValues]);

  const handleCreate = async (values: z.infer<typeof schema>) => {
    try {
      const body = {
        title: values.title,
        clientId: values.clientId,
        services: values.services,
        deliveryDate: values.deliveryDate,
        workUrl: values.workUrl,
        brandLogo: values.brandLogo,
        amount: values.amount,
        progress: values.progress ?? 0,
        assignees: values.assignees,
      };
      const res = await fetch(editingId ? `/api/projects/${editingId}` : '/api/projects', { method: editingId ? 'PUT' : 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Failed to create project');
      const created = await res.json();
      form.reset();
      if (onCreate) onCreate(created);
    } catch (err) {
      console.error('Failed to create project', err);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
        <FormField name="clientId" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Client</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {(clients || []).map(c => (
                    <SelectItem key={String(c.id ?? c._id)} value={String(c.id ?? c._id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField name="title" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Project Title</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField name="services" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Services</FormLabel>
            <div className="space-y-2 max-h-56 overflow-auto">
              {(services || []).map(s => {
                const serviceId = s.id ?? s._id;
                const current = field.value || [];
                const selected = current.some((obj:any)=>String(obj.id)===String(serviceId));
                const selectedObj = current.find((obj:any)=>String(obj.id)===String(serviceId));
                return (
                  <div key={String(serviceId)} className="flex items-center gap-2">
                    <Checkbox checked={selected} onCheckedChange={(checked) => {
                      const cur = field.value || [];
                      if (checked) field.onChange([...cur, { id: String(serviceId), name: s.name, amount: 0 }]);
                      else field.onChange(cur.filter((obj:any)=>String(obj.id)!==String(serviceId)));
                    }} />
                    <div className="flex-1">{s.name}</div>
                    {selected && (
                      <div className="w-36">
                        <Input type="number" value={String(selectedObj?.amount ?? 0)} onChange={(e) => {
                          const val = Number(e.target.value || 0);
                          const cur = field.value || [];
                          const next = cur.map((obj:any) => String(obj.id)===String(serviceId) ? { ...obj, amount: val } : obj);
                          field.onChange(next);
                        }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )} />

        <FormField name="deliveryDate" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Delivery Date</FormLabel>
            <FormControl>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full text-left">{field.value ? new Date(field.value).toLocaleDateString() : 'Pick a date'} <CalendarIcon className="ml-2 inline" /></Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                </PopoverContent>
              </Popover>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div>
          <FormField name="assignees" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Assign Team Members</FormLabel>
              <div className="space-y-2 max-h-48 overflow-auto">
                {(teamMembers || []).map(m => {
                  const memberId = m.id ?? m._id;
                  const current = field.value || [];
                  const selected = current.some((obj:any)=>String(obj.id)===String(memberId));
                  const selectedObj = current.find((obj:any)=>String(obj.id)===String(memberId));
                  return (
                    <div key={String(memberId)} className="flex items-center gap-2">
                      <Checkbox checked={selected} onCheckedChange={(checked) => {
                        const cur = field.value || [];
                        if (checked) field.onChange([...cur, { id: memberId, payout: 0 }]);
                        else field.onChange(cur.filter((obj:any)=>String(obj.id)!==String(memberId)));
                      }} />
                      <div className="flex-1">{m.name}</div>
                      {selected && (
                        <div className="w-36">
                          <Input type="number" value={String(selectedObj?.payout ?? 0)} onChange={(e) => {
                              const val = Number(e.target.value || 0);
                              const cur = field.value || [];
                              const next = cur.map((obj:any) => String(obj.id)===String(memberId) ? { ...obj, payout: val } : obj);
                              field.onChange(next);
                            }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </FormItem>
          )} />
        </div>

        <FormField name="workUrl" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Project Work URL (optional)</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField name="brandLogo" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Brand Logo (optional)</FormLabel>
            <FormControl>
              <div>
                <input type="file" accept="image/*" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    field.onChange(String(reader.result));
                  };
                  reader.readAsDataURL(f);
                }} />
                {field.value && (
                  <div className="mt-2">
                    <img src={field.value} alt="logo" className="h-12 w-12 object-contain" />
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField name="progress" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Progress (%)</FormLabel>
            <FormControl>
              <Input type="number" value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value || 0))} min={0} max={100} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField name="amount" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Project Amount (₹)</FormLabel>
            <FormControl>
              <Input type="number" value={field.value ?? ''} onChange={(e) => field.onChange(Number(e.target.value || 0))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" className="w-full">Add Project</Button>
      </form>
    </Form>
  );
}
