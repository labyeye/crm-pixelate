
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TeamMember } from "@/lib/data";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name is required." }),
  email: z.string().email({ message: "A valid email is required." }),
  phone: z.string().min(10, { message: "A valid phone number is required." }),
  address: z.string().min(5, { message: "Address is required." }),
  role: z.enum(['Web Developer', 'Editor', 'Designer', 'Project Manager']),
  pan: z.string().optional(),
  aadhar: z.string().optional(),
  secondaryPhone: z.string().optional(),
  secondaryEmail: z.string().email().optional().or(z.literal('')),
  salary: z.coerce.number().optional(),
});

type AddMemberDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddMember: (newMember: Omit<TeamMember, 'id'>) => void | Promise<void | TeamMember>;
  children: React.ReactNode;
};

export function AddMemberDialog({ isOpen, setIsOpen, onAddMember, children }: AddMemberDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      role: "Web Developer",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await onAddMember(values);
    form.reset();
    setIsOpen(false);
  }

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
                                    <SelectItem value="Web Developer">Web Developer</SelectItem>
                                    <SelectItem value="Editor">Editor</SelectItem>
                                    <SelectItem value="Designer">Designer</SelectItem>
                                    <SelectItem value="Project Manager">Project Manager</SelectItem>
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
