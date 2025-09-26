
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Quotation } from "@/lib/data";

const formSchema = z.object({
  client: z.string().min(2, { message: "Client name must be at least 2 characters." }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  services: z.string().min(10, { message: "Services must be at least 10 characters." }),
});

type AddQuotationDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddQuotation: (newQuote: Omit<Quotation, 'id' | 'status'>) => void;
};

export function AddQuotationDialog({ isOpen, setIsOpen, onAddQuotation }: AddQuotationDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client: "",
      amount: 0,
      services: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newQuote = {
        ...values,
        services: values.services.split(',').map(s => s.trim()),
    };
    onAddQuotation(newQuote);
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="text-lg">New Quotation</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl font-black tracking-tighter">New Quotation</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new quotation.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="client"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-base font-bold">CLIENT</FormLabel>
                        <FormControl>
                            <Input placeholder="Client Name" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-base font-bold">AMOUNT (₹)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="100000" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="services"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-base font-bold">SERVICES (comma-separated)</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Web Design, Development, SEO" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <DialogFooter>
                    <Button type="submit" size="lg" className="text-lg w-full mt-4">Create Quotation</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

