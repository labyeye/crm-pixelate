
'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { services as initialServices, Service, addService } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


const formSchema = z.object({
  name: z.string().min(2, { message: "Service name must be at least 2 characters." }),
});

export default function ServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>(initialServices);
  
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newService = addService({ name: values.name });
    setServices(prev => [...prev, newService]);
    form.reset();
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
              <TableRow key={s.id} className="border-b-2 border-black last:border-b-0">
                <TableCell className="font-mono text-base py-4">{s.id}</TableCell>
                <TableCell className="font-bold text-base py-4">{s.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
