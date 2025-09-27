
 'use client';

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import type { Quotation, Project } from "@/lib/data";
import { cn } from "@/lib/utils";
import { AddQuotationDialog } from "@/components/quotations/add-quotation-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QuotationPDF } from "@/components/quotations/quotation-pdf";
import { renderToString } from "react-dom/server";
import { useAuth } from "@/hooks/use-auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// This is a global state hack for demo purposes.
if (typeof window !== 'undefined' && !(window as any).__projectsStore) {
    (window as any).__projectsStore = [];
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/quotations');
        if (!res.ok) throw new Error(`Failed to fetch quotations: ${res.status}`);
        const items = await res.json();
        if (mounted) setQuotations(items as Quotation[]);
      } catch (err) {
        console.error('Failed to load quotations', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const addQuotation = (newQuoteData: Omit<Quotation, 'id' | 'status' | 'authorId' | 'clientName'>) => {
    if (!user) return;
    // for now, optimistic local creation; server-side creation will be added via API later
    const clientName = (newQuoteData.clientId != null) ? String(newQuoteData.clientId) : 'Unknown';
    const newId = `Q-${new Date().getFullYear()}-${(quotations.length + 1).toString().padStart(3, '0')}`;
    const newQuotation: Quotation = {
      ...newQuoteData,
      id: newId,
      status: 'PENDING',
      authorId: user.id,
      clientName,
    };
    setQuotations(prev => [newQuotation, ...prev]);
  };

  const updateStatus = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, status } : q));
  };
  
  const deleteQuotation = (id: string) => {
    setQuotations(prev => prev.filter(q => q.id !== id));
  };

  const createProjectFromQuote = (quote: Quotation) => {
  const servicesList = quote.services ?? [];
  const newProject: Project = {
    id: new Date().getTime(), // simple unique id
    title: `New Project for ${quote.clientName}`,
    client: quote.clientName,
    progress: 0,
    description: `Project created from quotation ${quote.id}. Services: ${servicesList.map(s => s.name).join(', ')}`,
  };

    // This is a global state hack for demo purposes.
    (window as any).__projectsStore.push(newProject);
    
    toast({
        title: "Project Created!",
        description: `A new project has been created for ${quote.clientName}.`,
    });
  };

  const generatePdf = (quote: Quotation) => {
    const doc = new jsPDF();
    const pdfContent = renderToString(<QuotationPDF quote={quote} />);
    doc.html(pdfContent, {
        callback: function (doc) {
            doc.save(`Quotation-${quote.id}.pdf`);
        },
        x: 10,
        y: 10,
        width: 180,
        windowWidth: 800
    });
  };

  const getAuthorName = (authorId: number | undefined) => {
    // we don't fetch users here for performance; return unknown when not provided
    return 'Unknown';
  }

  return (
    <div className="space-y-8 font-headline">
      <header className="flex items-center justify-between gap-4">
        <div>
            <h1 className="text-5xl font-black tracking-tighter">QUOTATIONS</h1>
            <p className="text-muted-foreground text-lg">Create, send, and track client quotations.</p>
        </div>
        <AddQuotationDialog 
            isOpen={isDialogOpen} 
            setIsOpen={setIsDialogOpen}
            onAddQuotation={addQuotation}
        >
            <Button size="lg" className="text-lg">New Quotation</Button>
        </AddQuotationDialog>
      </header>

      <div className="border-2 border-black">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-black">
              <TableHead className="text-base font-bold">Details</TableHead>
              <TableHead className="text-base font-bold">Client</TableHead>
              <TableHead className="text-base font-bold">Services</TableHead>
              <TableHead className="text-base font-bold text-right">Amount</TableHead>
              <TableHead className="text-base font-bold text-center">Status</TableHead>
              <TableHead className="text-base font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotations.map((quote) => (
              <TableRow key={quote.id} className="border-b-2 border-black last:border-b-0">
                <TableCell className="py-4">
                    <div className="font-bold text-base">{quote.id}</div>
                    <div className="text-sm text-muted-foreground">by {getAuthorName(quote.authorId)}</div>
                    <div className="text-sm text-muted-foreground">{quote.deliveryDate ? new Date(quote.deliveryDate).toLocaleDateString() : ''}</div>
                </TableCell>
                <TableCell className="text-base py-4 font-bold">{quote.clientName}</TableCell>
                <TableCell className="text-base py-4">
                    <div className="flex flex-wrap gap-1">
                        {(quote.services ?? []).map(s => <Badge key={s.id} variant="secondary">{s.name}</Badge>)}
                    </div>
                </TableCell>
                <TableCell className="text-right font-bold text-base py-4">₹{((quote.amount ?? 0) - (quote.discount ?? 0)).toLocaleString()}</TableCell>
                <TableCell className="text-center py-4">
                    <span className={cn("text-xl font-black tracking-widest p-2",
                      quote.status === 'APPROVED' && 'bg-success text-success-foreground',
                      quote.status === 'REJECTED' && 'bg-destructive text-destructive-foreground',
                      quote.status === 'PENDING' && 'bg-accent text-accent-foreground'
                    )}>
                        {quote.status}
                    </span>
                </TableCell>
                <TableCell className="text-right py-4">
                    <div className="flex items-center justify-end gap-2">
                        {quote.status === 'PENDING' && (
                            <>
                                {quote.id && <>
                                  <Button size="sm" variant="destructive" onClick={() => updateStatus(quote.id as string, 'REJECTED')}>REJECT</Button>
                                  <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90" onClick={() => updateStatus(quote.id as string, 'APPROVED')}>APPROVE</Button>
                                </>}
                            </>
                        )}
                        {quote.status === 'APPROVED' && (
                            <Button size="sm" onClick={() => createProjectFromQuote(quote)}>CREATE PROJECT</Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => generatePdf(quote)} className="font-bold">
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => quote.id && deleteQuotation(quote.id as string)} className="text-destructive font-bold">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
