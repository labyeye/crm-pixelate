
'use client';

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TeamMember } from "@/lib/data";
import { AddMemberDialog } from "@/components/developers-and-editors/add-member-dialog";
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
              <TableRow key={member.id} className="border-b-2 border-black last:border-b-0">
                <TableCell className="font-bold text-base py-4">{member.name}</TableCell>
                <TableCell className="text-base py-4">
                  <div>{member.email}</div>
                  <div>{member.phone}</div>
                </TableCell>
                <TableCell className="text-base py-4">{member.address}</TableCell>
                <TableCell className="text-right py-4 text-base font-bold uppercase">{member.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
