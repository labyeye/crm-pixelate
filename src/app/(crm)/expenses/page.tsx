"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AddExpenseDialog from '@/components/expenses/add-expense-dialog';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);

  const load = async () => {
    try {
      const res = await fetch('/api/expenses');
      if (!res.ok) throw new Error('Failed to fetch expenses');
      const json = await res.json();
      setExpenses(json || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-8 font-headline">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black">EXPENSES</h1>
          <p className="text-muted-foreground">Track your expenses and payouts.</p>
        </div>
        <AddExpenseDialog onCreated={load} />
      </header>

      <Card className="border-2 border-black">
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
          <CardDescription>Recent expenses and details</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map(e => (
                <TableRow key={e._id ?? e.id}>
                  <TableCell className="font-bold">{e.title}</TableCell>
                  <TableCell>{e.category}</TableCell>
                  <TableCell className="text-right">₹{Number(e.amount || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right">{e.createdAt ? new Date(e.createdAt).toLocaleDateString() : ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
