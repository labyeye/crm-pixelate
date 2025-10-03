
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Quotation, Service, Client } from "@/lib/data";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { ScrollArea } from "../ui/scroll-area";
import React from "react";
import { Separator } from "../ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";


const formSchema = z.object({
  // IDs come from the database as `_id` (ObjectId). We normalize to strings on the client,
  // so validate clientId and service ids as non-empty strings.
  clientId: z.string({ required_error: "Please select a client." }).min(1, "Please select a client."),
  services: z.array(z.object({ id: z.string(), name: z.string() })).min(1, "At least one service is required."),
  amount: z.coerce.number().positive("Amount must be positive."),
  discount: z.coerce.number().min(0, "Discount cannot be negative.").default(0),
  deliveryDate: z.date({ required_error: "A delivery date is required."}),
});

type AddQuotationDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  // The client sends clientId and service ids as strings (normalized from `_id`).
  onAddQuotation: (newQuote: Omit<Quotation, 'id' | 'status' | 'authorId' | 'clientName'> & { clientId: string; services: { id: string; name: string }[] }) => void;
  children: React.ReactNode;
};

export function AddQuotationDialog({ isOpen, setIsOpen, onAddQuotation, children }: AddQuotationDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      services: [],
      amount: 0,
      discount: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddQuotation(values);
    form.reset();
    setIsOpen(false);
  }

  // client-side fetched lists to avoid importing server-only modules into the client bundle
  // Use local types where we guarantee `id` is a string for keys and select values.
  type LocalClient = Client & { id: string };
  type LocalService = Service & { id: string };

  const [allServices, setAllServices] = React.useState<LocalService[]>([]);
  const [allClients, setAllClients] = React.useState<LocalClient[]>([]);

  React.useEffect(() => {
    let mounted = true;
    if (!isOpen) return;
    (async () => {
      try {
        const [sRes, cRes] = await Promise.all([fetch('/api/services'), fetch('/api/clients')]);
        if (!sRes.ok || !cRes.ok) return;
  const [sJson, cJson] = await Promise.all([sRes.json(), cRes.json()]);
        if (!mounted) return;
  // Normalize server objects: prefer `id` if present, otherwise use `._id` as string.
  const normServices = (sJson as any[] || []).map(s => ({ ...s, id: s.id ?? (s._id ? String(s._id) : String(s.id)) })) as LocalService[];
  const normClients = (cJson as any[] || []).map(c => ({ ...c, id: c.id ?? (c._id ? String(c._id) : String(c.id)) })) as LocalClient[];
  setAllServices(normServices);
  setAllClients(normClients);
      } catch (e) {
        // ignore fetch errors; keep lists empty
        console.error('Failed to load services or clients', e);
      }
    })();
    return () => { mounted = false; };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
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
                    
                    <FormField
                      control={form.control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a client" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(allClients ?? []).filter(c => c.id != null).map(client => (
                                <SelectItem key={String(client.id)} value={String(client.id)}>
                                  {client.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Separator className="border-t-2 border-black" />

                    <FormField control={form.control} name="services" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Services</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant="outline" role="combobox" className={cn("w-full justify-between h-auto", !field.value.length && "text-muted-foreground")}>
                                        <div className="flex flex-wrap gap-1">
                                            {field.value.length > 0 ? field.value.map(s => <div key={String(s.id)} className="bg-muted text-muted-foreground text-xs font-bold p-1">{s.name}</div>) : "Select services"}
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
                        key={String(service.id)}
                        // Prevent the popover/command from closing on mouse down so multiple
                        // services can be toggled without the command losing focus.
                        onMouseDown={(e) => e.preventDefault()}
                        onSelect={(val: string) => {
                          const currentServices = field.value || [];
                          const isSelected = currentServices.some(s => String(s.id) === String(service.id));
                          if (isSelected) {
                            field.onChange(currentServices.filter(s => String(s.id) !== String(service.id)));
                          } else {
                            field.onChange([...currentServices, { ...service, id: String(service.id) }]);
                          }
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", field.value.some(s => String(s.id) === String(service.id)) ? "opacity-100" : "opacity-0")} />
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
