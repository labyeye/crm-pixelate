
'use client';

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { clients as initialClients, Client, addClient } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { AddClientDialog } from "@/components/clients/add-client-dialog";
import { Badge } from "@/components/ui/badge";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleAddClient = (newClientData: Omit<Client, 'id'>) => {
    const newClient = addClient(newClientData);
    setClients(prev => [...prev, newClient]);
  };

  return (
    <div className="space-y-8 font-headline">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">CLIENTS</h1>
          <p className="text-muted-foreground text-lg">Manage all your clients.</p>
        </div>
        <AddClientDialog 
            isOpen={isDialogOpen}
            setIsOpen={setIsDialogOpen}
            onAddClient={handleAddClient}
        >
            <Button size="lg" className="text-lg">Add Client</Button>
        </AddClientDialog>
      </header>

      <div className="border-2 border-black">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-black">
              <TableHead className="text-base font-bold">Name</TableHead>
              <TableHead className="text-base font-bold">Contact</TableHead>
              <TableHead className="text-base font-bold">Address</TableHead>
              <TableHead className="text-right text-base font-bold">GST</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((c) => (
              <TableRow key={c.id} className="border-b-2 border-black last:border-b-0">
                <TableCell className="font-bold text-base py-4">{c.name}</TableCell>
                <TableCell className="text-base py-4">
                    <div>{c.email}</div>
                    <div>{c.phone}</div>
                </TableCell>
                <TableCell className="text-base py-4">{c.address}</TableCell>
                <TableCell className="text-right py-4">
                    {c.hasGst ? <Badge>Registered</Badge> : <Badge variant="secondary">Not Registered</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
