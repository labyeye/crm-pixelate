
'use client';

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { users as initialUsers, User, addUser } from "@/lib/data";
import { AddUserDialog } from "@/components/developers-and-editors/add-user-dialog";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DevelopersAndEditorsPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
  
  const handleAddUser = (newUser: Omit<User, 'id'>) => {
    const addedUser = addUser(newUser);
    setUsers(prev => [...prev, addedUser]);
  };

  return (
    <div className="space-y-8 font-headline">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">DEVELOPERS & EDITORS</h1>
          <p className="text-muted-foreground text-lg">Manage all developers and editors in the system.</p>
        </div>
        <AddUserDialog 
            isOpen={isDialogOpen}
            setIsOpen={setIsDialogOpen}
            onAddUser={handleAddUser}
        >
            <Button size="lg" className="text-lg">Add New</Button>
        </AddUserDialog>
      </header>

      <div className="border-2 border-black">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-black">
              <TableHead className="text-base font-bold">Name</TableHead>
              <TableHead className="text-base font-bold">Email</TableHead>
              <TableHead className="text-right text-base font-bold">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} className="border-b-2 border-black last:border-b-0">
                <TableCell className="font-bold text-base py-4">{u.name}</TableCell>
                <TableCell className="text-base py-4">{u.email}</TableCell>
                <TableCell className="text-right py-4 text-base font-bold uppercase">{u.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
