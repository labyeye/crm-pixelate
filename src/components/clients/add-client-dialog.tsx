
'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import type { Client } from "@/lib/data";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "../ui/scroll-area";
import React from "react";
import { useEffect } from "react";
import { Separator } from "../ui/separator";


const formSchema = z.object({
  name: z.string().min(2, "Client name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(10, "Invalid phone number."),
  address: z.string().min(5, "Address is required."),
  hasGst: z.boolean().default(false),
  gstCompanyName: z.string().optional(),
  gstNumber: z.string().optional(),
  gstAddress: z.string().optional(),
}).refine(data => {
    if (data.hasGst) {
        return !!data.gstCompanyName && !!data.gstNumber && !!data.gstAddress;
    }
    return true;
}, {
    message: "GST details are required when toggled on.",
    path: ["gstCompanyName"], // you can pick any of the dependent fields
});

type AddClientDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddClient?: (newClient: Omit<Client, 'id'>) => void | Promise<void | Client>;
  // onSave is used when editing an existing client
  onSave?: (id: string | number, update: Partial<Client>) => void | Promise<void | Client>;
  // initialValues when editing
  initialValues?: Partial<Client>;
  children: React.ReactNode;
};

export function AddClientDialog({ isOpen, setIsOpen, onAddClient, onSave, initialValues, children }: AddClientDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      email: initialValues?.email ?? "",
      phone: initialValues?.phone ?? "",
      address: initialValues?.address ?? "",
      hasGst: initialValues?.hasGst ?? false,
    },
  });

  const hasGst = form.watch("hasGst");

  // When initialValues change (e.g. opening edit dialog), reset the form to show current values.
  useEffect(() => {
    if (initialValues) {
      form.reset({
        name: initialValues.name ?? "",
        email: initialValues.email ?? "",
        phone: initialValues.phone ?? "",
        address: initialValues.address ?? "",
        hasGst: initialValues.hasGst ?? false,
        gstCompanyName: initialValues.gstCompanyName ?? undefined,
        gstNumber: initialValues.gstNumber ?? undefined,
        gstAddress: initialValues.gstAddress ?? undefined,
      });
    }
  }, [initialValues]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (initialValues && (initialValues._id || initialValues.id)) {
      const id = initialValues._id ?? initialValues.id;
      if (onSave) {
        await onSave(id as any, values as Partial<Client>);
      }
    } else {
      if (onAddClient) {
        await onAddClient(values);
      }
    }
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl font-black tracking-tighter">New Client</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new client.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <ScrollArea className="h-[60vh] pr-6">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Client Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Client Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Client Phone</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="address" render={({ field }) => (
                           <FormItem className="md:col-span-2"><FormLabel>Client Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    
                    <Separator className="border-t-2 border-black" />

                    <div className="space-y-4">
                        <FormField control={form.control} name="hasGst" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Has GST</FormLabel>
                                    <FormDescription>Does this client have a GST registration?</FormDescription>
                                </div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )} />
                        {hasGst && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4">
                                <FormField control={form.control} name="gstCompanyName" render={({ field }) => (
                                    <FormItem className="md:col-span-2"><FormLabel>GST Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="gstNumber" render={({ field }) => (
                                    <FormItem><FormLabel>GST Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="gstAddress" render={({ field }) => (
                                    <FormItem><FormLabel>GST Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        )}
                    </div>
                </div>
              </ScrollArea>
        <DialogFooter className="pt-8">
          <Button type="submit" size="lg" className="text-lg w-full">{initialValues ? 'Save Changes' : 'Create Client'}</Button>
              </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
