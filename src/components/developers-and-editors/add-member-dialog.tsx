
'use client';

import React from 'react';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TeamMember } from "@/lib/data";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name is required." }),
  email: z.string().email({ message: "A valid email is required." }),
  phone: z.string().min(10, { message: "A valid phone number is required." }),
  address: z.string().min(5, { message: "Address is required." }),
  // include founder roles and standard roles
  role: z.union([z.literal('Founder'), z.literal('Co-Founder'), z.literal('Web Developer'), z.literal('Editor'), z.literal('Designer'), z.literal('Project Manager'), z.literal('Lead Generator')]),
  pan: z.string().optional(),
  aadhar: z.string().optional(),
  secondaryPhone: z.string().optional(),
  secondaryEmail: z.string().email().optional().or(z.literal('')),
  salary: z.coerce.number().optional(),
});

type AddMemberDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  // allow onAddMember to return a Promise or sync value
  onAddMember?: (newMember: Omit<TeamMember, 'id'>) => void | Promise<void | TeamMember>;
  // Support edit mode
  onSave?: (id: string | number, update: Partial<TeamMember>) => void | Promise<void | TeamMember>;
  initialValues?: Partial<TeamMember>;
  children: React.ReactNode;
};

export function AddMemberDialog({ isOpen, setIsOpen, onAddMember, onSave, initialValues, children }: AddMemberDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      email: initialValues?.email ?? "",
      phone: initialValues?.phone ?? "",
      address: initialValues?.address ?? "",
  role: initialValues?.role ?? "Web Developer",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (initialValues && (initialValues._id || initialValues.id)) {
      const id = initialValues._id ?? initialValues.id;
      if (onSave) await onSave(id as any, values as Partial<TeamMember>);
    } else {
      if (onAddMember) await onAddMember(values);
    }
    form.reset();
    setIsOpen(false);
  }

  // Reset form when editing an existing member
  React.useEffect(() => {
    if (initialValues) {
      form.reset({
        name: initialValues.name ?? "",
        email: initialValues.email ?? "",
        phone: initialValues.phone ?? "",
        address: initialValues.address ?? "",
        role: initialValues.role ?? "Web Developer",
        pan: initialValues.pan ?? undefined,
        aadhar: initialValues.aadhar ?? undefined,
        secondaryPhone: initialValues.secondaryPhone ?? undefined,
        secondaryEmail: initialValues.secondaryEmail ?? undefined,
        salary: initialValues.salary ?? undefined,
      });
    }
  }, [initialValues]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl font-black tracking-tighter">Add New Team Member</DialogTitle>
          <DialogDescription>
            Fill in the details for the new developer, editor, or designer.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Primary Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel>Primary Phone</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="role" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                                              <SelectContent>
                                <SelectItem value="Founder">Founder</SelectItem>
                                <SelectItem value="Co-Founder">Co-Founder</SelectItem>
                                <SelectItem value="Web Developer">Web Developer</SelectItem>
                                <SelectItem value="Editor">Editor</SelectItem>
                                <SelectItem value="Designer">Designer</SelectItem>
                                <SelectItem value="Project Manager">Project Manager</SelectItem>
                                <SelectItem value="Lead Generator">Lead Generator</SelectItem>
                                              </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="salary" render={({ field }) => (
                        <FormItem><FormLabel>Salary (Optional)</FormLabel><FormControl><Input type="number" placeholder="e.g., 50000" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="pan" render={({ field }) => (
                        <FormItem><FormLabel>PAN (Optional)</FormLabel><FormControl><Input placeholder="ABCDE1234F" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="aadhar" render={({ field }) => (
                        <FormItem><FormLabel>Aadhar (Optional)</FormLabel><FormControl><Input placeholder="1234 5678 9012" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="secondaryEmail" render={({ field }) => (
                        <FormItem><FormLabel>Secondary Email (Optional)</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="secondaryPhone" render={({ field }) => (
                        <FormItem><FormLabel>Secondary Phone (Optional)</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <DialogFooter>
                    <Button type="submit" size="lg" className="text-lg w-full mt-4">Create Team Member</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
