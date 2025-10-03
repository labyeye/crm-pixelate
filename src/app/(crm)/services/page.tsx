
'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Service } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


const formSchema = z.object({
  name: z.string().min(2, { message: "Service name must be at least 2 characters." }),
});

export default function ServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/services');
        if (!res.ok) throw new Error(`Failed to fetch services: ${res.status}`);
        const items = await res.json();
        if (mounted) setServices(items as Service[]);
      } catch (err) {
        console.error('Failed to load services', err);
      }
    })();
    return () => { mounted = false; };
  }, []);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });
  
  if (user?.role !== 'admin') {
    return (
        <div className="space-y-8 font-headline">
             <Card className="border-2 border-black">
                <CardHeader>
                    <CardTitle className="text-2xl font-black tracking-tighter">Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg">You do not have permission to view this page.</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const res = await fetch('/api/services', { method: 'POST', body: JSON.stringify({ name: values.name }), headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error(`Failed to create service: ${res.status}`);
      const newService = await res.json();
      setServices(prev => [...prev, newService as Service]);
      form.reset();
    } catch (err) {
      console.error('Failed to add service', err);
    }
  };

  const [editingServiceId, setEditingServiceId] = useState<string | number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const startEdit = (s: Service) => {
    setEditingServiceId(s._id ?? s.id ?? null);
    setEditingValue(s.name);
  };

  const cancelEdit = () => {
    setEditingServiceId(null);
    setEditingValue('');
  };

  const saveEdit = async () => {
    if (!editingServiceId) return;
    try {
      const res = await fetch(`/api/services/${editingServiceId}`, { method: 'PUT', body: JSON.stringify({ name: editingValue }), headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error(`Failed to update service: ${res.status}`);
      const updated = await res.json();
      setServices(prev => prev.map(s => ((s._id ?? s.id) === (updated._id ?? updated.id) ? updated : s)));
      cancelEdit();
    } catch (err) {
      console.error('Failed to save service', err);
    }
  };

  const deleteService = async (s: Service) => {
    try {
      const id = s._id ?? s.id;
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Failed to delete service: ${res.status}`);
      setServices(prev => prev.filter(x => (x._id ?? x.id) !== id));
    } catch (err) {
      console.error('Failed to delete service', err);
    }
  };

  return (
    <div className="space-y-8 font-headline">
      <header>
        <h1 className="text-5xl font-black tracking-tighter">SERVICES</h1>
        <p className="text-muted-foreground text-lg">Manage the services your agency offers.</p>
      </header>

      <Card className="border-2 border-black">
        <CardHeader>
            <CardTitle className="text-2xl font-black tracking-tighter">Add New Service</CardTitle>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="flex-grow">
                            <FormControl>
                                <Input placeholder="e.g., Video Editing" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" size="lg" className="text-lg h-14">Add Service</Button>
                </form>
            </Form>
        </CardContent>
      </Card>

      <div className="border-2 border-black">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-black">
              <TableHead className="text-base font-bold">Service ID</TableHead>
              <TableHead className="text-base font-bold">Service Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((s) => (
              <TableRow key={s._id ?? s.id} className="border-b-2 border-black last:border-b-0">
                <TableCell className="font-mono text-base py-4">{s._id ?? s.id}</TableCell>
                <TableCell className="font-bold text-base py-4">
                  {editingServiceId === (s._id ?? s.id) ? (
                    <div className="flex items-center gap-2">
                      <Input value={editingValue} onChange={(e) => setEditingValue(e.target.value)} />
                      <Button size="sm" onClick={saveEdit}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit}>Cancel</Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>{s.name}</div>
                      <div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => startEdit(s)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteService(s)} className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
