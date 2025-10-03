
'use client';

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TeamMember } from "@/lib/data";
import { AddMemberDialog } from "@/components/developers-and-editors/add-member-dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DevelopersAndEditorsPage() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/team-members');
        if (!res.ok) throw new Error(`Failed to fetch team members: ${res.status}`);
        const items = await res.json();
        if (mounted) setTeamMembers(items as TeamMember[]);
      } catch (err) {
        console.error('Failed to load team members', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

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
  
  const handleAddMember = async (newMemberData: Omit<TeamMember, 'id'>) => {
    try {
      const res = await fetch('/api/team-members', { method: 'POST', body: JSON.stringify(newMemberData), headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error(`Failed to create team member: ${res.status}`);
      const addedMember = await res.json();
      setTeamMembers(prev => [...prev, addedMember as TeamMember]);
    } catch (err) {
      console.error('Failed to add member', err);
      throw err;
    }
  };

  const handleDeleteMember = async (member: TeamMember) => {
    try {
      const id = member._id ?? member.id;
      const res = await fetch(`/api/team-members/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Failed to delete member: ${res.status}`);
      setTeamMembers(prev => prev.filter(m => (m._id ?? m.id) !== id));
    } catch (err) {
      console.error('Failed to delete member', err);
    }
  };

  const handleSaveMember = async (id: string | number, update: Partial<TeamMember>) => {
    try {
      const res = await fetch(`/api/team-members/${id}`, { method: 'PUT', body: JSON.stringify(update), headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error(`Failed to update member: ${res.status}`);
      const updated = await res.json();
      setTeamMembers(prev => prev.map(m => ((m._id ?? m.id) === id ? updated : m)));
    } catch (err) {
      console.error('Failed to save member', err);
      throw err;
    }
  };

  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <div className="space-y-8 font-headline">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">DEVELOPERS & EDITORS</h1>
          <p className="text-muted-foreground text-lg">Manage your creative and technical team members.</p>
        </div>
    <AddMemberDialog 
      isOpen={isDialogOpen}
      setIsOpen={setIsDialogOpen}
      onAddMember={handleAddMember}
    >
      <Button size="lg" className="text-lg">Add New</Button>
    </AddMemberDialog>

    <AddMemberDialog
      isOpen={isEditDialogOpen}
      setIsOpen={setIsEditDialogOpen}
      initialValues={editingMember ?? undefined}
      onSave={handleSaveMember as any}
    >
      <div />
    </AddMemberDialog>
      </header>

      <div className="border-2 border-black">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-black">
              <TableHead className="text-base font-bold">Name</TableHead>
              <TableHead className="text-base font-bold">Contact</TableHead>
              <TableHead className="text-base font-bold">Address</TableHead>
              <TableHead className="text-right text-base font-bold">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map((member) => (
              <TableRow key={member._id ?? member.id} className="border-b-2 border-black last:border-b-0">
                <TableCell className="font-bold text-base py-4">{member.name}</TableCell>
                <TableCell className="text-base py-4">
                  <div>{member.email}</div>
                  <div>{member.phone}</div>
                </TableCell>
                <TableCell className="text-base py-4">{member.address}</TableCell>
                <TableCell className="text-right py-4 text-base font-bold uppercase">
                  <div className="flex items-center justify-end gap-2">
                    <div>{member.role}</div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditingMember(member); setIsEditDialogOpen(true); }}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteMember(member)} className="text-destructive">Delete</DropdownMenuItem>
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
