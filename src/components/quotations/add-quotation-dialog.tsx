
'use client';

import { useForm, Controller } from "react-hook-form";
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
import type { Quotation, Service } from "@/lib/data";
import { services as allServices } from "@/lib/data";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { ScrollArea } from "../ui/scroll-area";
import React from "react";
import { Separator } from "../ui/separator";


const formSchema = z.object({
  clientName: z.string().min(2, "Client name is required."),
  clientEmail: z.string().email("Invalid email address."),
  clientPhone: z.string().min(10, "Invalid phone number."),
  clientAddress: z.string().min(5, "Address is required."),
  hasGst: z.boolean().default(false),
  gstCompanyName: z.string().optional(),
  gstNumber: z.string().optional(),
  gstAddress: z.string().optional(),
  services: z.array(z.object({ id: z.number(), name: z.string() })).min(1, "At least one service is required."),
  amount: z.coerce.number().positive("Amount must be positive."),
  discount: z.coerce.number().min(0, "Discount cannot be negative.").default(0),
  deliveryDate: z.date({ required_error: "A delivery date is required."}),
}).refine(data => {
    if (data.hasGst) {
        return !!data.gstCompanyName && !!data.gstNumber && !!data.gstAddress;
    }
    return true;
}, {
    message: "GST details are required when toggled on.",
    path: ["gstCompanyName"], // you can pick any of the dependent fields
});

type AddQuotationDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddQuotation: (newQuote: Omit<Quotation, 'id' | 'status' | 'authorId'>) => void;
  children: React.ReactNode;
};

export function AddQuotationDialog({ isOpen, setIsOpen, onAddQuotation, children }: AddQuotationDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientAddress: "",
      hasGst: false,
      services: [],
      amount: 0,
      discount: 0,
    },
  });

  const hasGst = form.watch("hasGst");

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddQuotation(values);
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
          <DialogTitle className="font-headline text-3xl font-black tracking-tighter">New Quotation</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new quotation.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <ScrollArea className="h-[60vh] pr-6">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="clientName" render={({ field }) => (
                            <FormItem><FormLabel>Client Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="clientEmail" render={({ field }) => (
                            <FormItem><FormLabel>Client Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="clientPhone" render={({ field }) => (
                            <FormItem><FormLabel>Client Phone</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="clientAddress" render={({ field }) => (
                           <FormItem className="md:col-span-2"><FormLabel>Client Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    
                    <Separator className="border-t-2 border-black" />

                    <FormField control={form.control} name="services" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Services</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant="outline" role="combobox" className={cn("w-full justify-between h-auto", !field.value.length && "text-muted-foreground")}>
                                        <div className="flex flex-wrap gap-1">
                                            {field.value.length > 0 ? field.value.map(s => <div key={s.id} className="bg-muted text-muted-foreground text-xs font-bold p-1">{s.name}</div>) : "Select services"}
                                        </div>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search services..." />
                                        <CommandEmpty>No service found.</CommandEmpty>
                                        <CommandGroup>
                                        {allServices.map((service) => (
                                            <CommandItem
                                                value={service.name}
                                                key={service.id}
                                                onSelect={() => {
                                                    const currentServices = field.value || [];
                                                    const isSelected = currentServices.some(s => s.id === service.id);
                                                    if (isSelected) {
                                                        field.onChange(currentServices.filter(s => s.id !== service.id));
                                                    } else {
                                                        field.onChange([...currentServices, service]);
                                                    }
                                                }}
                                            >
                                                <Check className={cn("mr-2 h-4 w-4", field.value.some(s => s.id === service.id) ? "opacity-100" : "opacity-0")} />
                                                {service.name}
                                            </CommandItem>
                                        ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <Separator className="border-t-2 border-black" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="amount" render={({ field }) => (
                            <FormItem><FormLabel>Amount (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="discount" render={({ field }) => (
                            <FormItem><FormLabel>Discount (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="deliveryDate" render={({ field }) => (
                            <FormItem className="flex flex-col"><FormLabel>Delivery Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal h-14", !field.value && "text-muted-foreground")}>
                                            {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus/>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <Separator className="border-t-2 border-black" />

                    <div className="space-y-4">
                        <FormField control={form.control} name="hasGst" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Apply GST</FormLabel>
                                    <FormDescription>Include GST details in the quotation.</FormDescription>
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
                  <Button type="submit" size="lg" className="text-lg w-full">Create Quotation</Button>
              </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    