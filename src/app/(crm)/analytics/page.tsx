"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function AnalyticsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [pRes, iRes, cRes, tRes, sRes, eRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/invoices'),
          fetch('/api/clients'),
          fetch('/api/team-members'),
          fetch('/api/services'),
          fetch('/api/expenses'),
        ]);
        const [pJson, iJson, cJson, tJson, sJson, eJson] = await Promise.all([
          pRes.json(),
          iRes.json(),
          cRes.json(),
          tRes.json(),
          sRes.json(),
          eRes.json(),
        ]);
        if (!mounted) return;
        setProjects(pJson || []);
        setInvoices(iJson || []);
        setClients(cJson || []);
        setTeam(tJson || []);
        setServicesList(sJson || []);
        setExpenses(eJson || []);
      } catch (e) {
        console.error("Failed to load analytics data", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const totalProjects = projects.length;
  const totalInvoices = invoices.length;
  const totalRevenue = invoices.reduce(
    (s, inv) => s + Number(inv.amount || 0),
    0
  );
  // Collected should include partial payments: prefer paidAmount, fallback to full amount for PAID status
  const collected = invoices.reduce((s, inv) => {
    const paid =
      Number(inv.paidAmount ?? (inv.status === "PAID" ? inv.amount : 0)) || 0;
    return s + paid;
  }, 0);
  const pending = Math.max(0, totalRevenue - collected);

  const totalExpenses = expenses.reduce((s, ex) => s + Number(ex.amount || 0), 0);
  const expensesByCategory = expenses.reduce((acc: Record<string, number>, ex) => {
    const cat = ex.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + Number(ex.amount || 0);
    return acc;
  }, {});

  const staffCount = team.length;
  const serviceCategories = servicesList.length;
  const assignedCount = projects.reduce(
    (s, p) => s + ((p.assignees || []).length || 0),
    0
  );

  // Earnings for developers/editors: sum of payouts in project assignees where assignee matches team member role
  const devEditorEarnings = useMemo(() => {
    const earnings: { developers: number; editors: number } = {
      developers: 0,
      editors: 0,
    };
    const byId: Record<string, any> = {};
    for (const member of team || [])
      byId[String(member._id ?? member.id)] = member;
    for (const p of projects || []) {
      for (const a of p.assignees || []) {
        const member = byId[String(a.id)];
        const payout = Number(a.payout || 0);
        if (!member) continue;
        const role = (member.role || "").toLowerCase();
        if (role.includes("developer")) earnings.developers += payout;
        if (role.includes("editor")) earnings.editors += payout;
      }
    }
    return earnings;
  }, [projects, team]);

  // Monthly revenue and collected amounts for last 12 months
  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    const months: { month: string; revenue: number; collected: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: `${MONTH_NAMES[d.getMonth()]} ${d
          .getFullYear()
          .toString()
          .slice(-2)}`,
        revenue: 0,
        collected: 0,
      });
    }
    for (const inv of invoices || []) {
      const created = inv.createdAt
        ? new Date(inv.createdAt)
        : inv.dueDate
        ? new Date(inv.dueDate)
        : null;
      if (!created || Number.isNaN(created.getTime())) continue;
      const monthsAgo =
        (now.getFullYear() - created.getFullYear()) * 12 +
        (now.getMonth() - created.getMonth());
      if (monthsAgo >= 0 && monthsAgo < 12) {
        const idx = 11 - monthsAgo;
        months[idx].revenue += Number(inv.amount || 0);
        const paid =
          Number(inv.paidAmount ?? (inv.status === "PAID" ? inv.amount : 0)) ||
          0;
        months[idx].collected += paid;
      }
    }
    return months;
  }, [invoices]);

  // Monthly expenses for last 12 months (red bar chart)
  const monthlyExpenses = useMemo(() => {
    const now = new Date();
    const months: { month: string; expense: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ month: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`, expense: 0 });
    }
    for (const ex of expenses || []) {
      const created = ex.createdAt ? new Date(ex.createdAt) : null;
      if (!created || Number.isNaN(created.getTime())) continue;
      const monthsAgo = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());
      if (monthsAgo >= 0 && monthsAgo < 12) {
        const idx = 11 - monthsAgo;
        months[idx].expense += Number(ex.amount || 0);
      }
    }
    return months;
  }, [expenses]);

  const projectsByStatus = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const p of projects || []) {
      const s = (p.status || "BACKLOG").toUpperCase();
      acc[s] = (acc[s] || 0) + 1;
    }
    return Object.entries(acc).map(([status, count]) => ({ status, count }));
  }, [projects]);

  const topClients = useMemo(() => {
    const map: Record<string, number> = {};
    for (const inv of invoices || []) {
      const id = inv.clientId ?? inv.client ?? inv.clientName ?? "Unknown";
      map[id] = (map[id] || 0) + Number(inv.amount || 0);
    }
    const rows = Object.entries(map).map(([id, amt]) => ({
      id,
      amt,
      name:
        clients.find((c) => String(c._id ?? c.id) === String(id))?.name || id,
    }));
    return rows.sort((a, b) => b.amt - a.amt).slice(0, 10);
  }, [invoices, clients]);

  const recentPayments = useMemo(() => {
    return (invoices || [])
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      )
      .slice(0, 8);
  }, [invoices]);

  // Earnings by staff: totals and per-client breakdown based on project assignee payouts
  const earningsByStaff = useMemo(() => {
    const byId: Record<string, any> = {};
    // initialize from team
    for (const m of team || []) {
      const id = String(m._id ?? m.id);
      byId[id] = {
        id,
        name: m.name || id,
        role: m.role || "",
        total: 0,
        clients: {} as Record<string, number>,
      };
    }

    const getClientName = (proj: any) => {
      const cid = proj.clientId ?? proj.client ?? proj.clientName ?? "";
      return (
        clients.find((c) => String(c._id ?? c.id) === String(cid))?.name ||
        proj.clientName ||
        proj.client ||
        "Unknown"
      );
    };

    for (const p of projects || []) {
      const clientName = getClientName(p);
      for (const a of p.assignees || []) {
        const mid = String(a.id ?? "unknown");
        const payout = Number(a.payout || 0);
        if (!byId[mid]) {
          // create placeholder for unlisted member
          byId[mid] = {
            id: mid,
            name: String(mid),
            role: "",
            total: 0,
            clients: {} as Record<string, number>,
          };
        }
        byId[mid].total += payout;
        byId[mid].clients[clientName] =
          (byId[mid].clients[clientName] || 0) + payout;
      }
    }

    return Object.values(byId).sort((a, b) => b.total - a.total);
  }, [projects, team, clients]);

  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7f50",
    "#a0d3ff",
    "#d0a0ff",
  ];

  return (
    <div className="space-y-8 font-headline">
      <header>
        <h1 className="text-5xl font-black tracking-tighter">ANALYTICS</h1>
        <p className="text-muted-foreground text-lg">
          Comprehensive analytics for your CRM — projects, invoices, and
          payments.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Staff</CardTitle>
            <CardDescription>Total team members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{staffCount}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Service Categories</CardTitle>
            <CardDescription>Distinct services offered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{serviceCategories}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Assigned Roles</CardTitle>
            <CardDescription>Total assignees across projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{assignedCount}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Dev / Editor Earnings</CardTitle>
            <CardDescription>
              Sum of payouts to developers and editors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              Developers: ₹
              {Number(devEditorEarnings.developers || 0).toLocaleString()}
            </div>
            <div className="text-sm">
              Editors: ₹
              {Number(devEditorEarnings.editors || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Total Projects</CardTitle>
            <CardDescription>Projects created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{totalProjects}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Total Invoices</CardTitle>
            <CardDescription>Invoices issued</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{totalInvoices}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Revenue Generated</CardTitle>
            <CardDescription>Total of all invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">
              ₹{Number(totalRevenue || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Revenue Collected</CardTitle>
            <CardDescription>
              Sum of recorded payments (includes partials)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">
              ₹{Number(collected || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Revenue Pending</CardTitle>
            <CardDescription>Remaining amount unpaid</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">
              ₹{Number(pending || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
            <CardDescription>Sum of recorded expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">₹{Number(totalExpenses || 0).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-2 border-black lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-2xl font-black">Monthly Expenses (12 months)</CardTitle>
            <CardDescription>Shows expenses by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyExpenses} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString()}`} />
                  <Bar dataKey="expense" fill="#dc2626" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>Recent expenses recorded in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(expenses || []).map((ex) => (
                  <TableRow key={ex._id ?? ex.id}> 
                    <TableCell className="font-bold">{ex.title || 'N/A'}</TableCell>
                    <TableCell>{ex.category || 'Uncategorized'}</TableCell>
                    <TableCell className="text-right">₹{Number(ex.amount || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{ex.createdAt ? new Date(ex.createdAt).toLocaleDateString() : '-'}</TableCell>
                    <TableCell className="text-sm">{ex.note || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-2 border-black">
          <CardHeader>
            <CardTitle className="text-2xl font-black">
              Monthly Revenue (12 months)
            </CardTitle>
            <CardDescription>
              Shows total invoice amounts by month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyRevenue}
                  margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    formatter={(v: any) => `₹${Number(v).toLocaleString()}`}
                  />
                  <Bar dataKey="collected" fill="#16a34a" name="Collected" />
                  <Bar dataKey="revenue" fill="#4f46e5" name="Generated" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="text-2xl font-black">
              Projects by Status
            </CardTitle>
            <CardDescription>Distribution of project statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectsByStatus}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={40}
                    outerRadius={80}
                    label
                  >
                    {projectsByStatus.map((entry, idx) => (
                      <Cell
                        key={entry.status}
                        fill={colors[idx % colors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Top Clients (by invoice amount)</CardTitle>
            <CardDescription>
              Clients who generated the most revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topClients.map((c, idx) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-bold">{c.name}</TableCell>
                    <TableCell className="text-right">
                      ₹{Number(c.amt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Latest invoices created / updated</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((inv) => (
                  <TableRow key={inv._id ?? inv.id}>
                    <TableCell className="font-bold">
                      {inv._id ?? inv.id}
                    </TableCell>
                    <TableCell>
                      {inv.clientName ||
                        inv.client ||
                        clients.find(
                          (c) => String(c._id ?? c.id) === String(inv.clientId)
                        )?.name ||
                        "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{Number(inv.amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-bold",
                        inv.status === "PAID"
                          ? "text-success"
                          : inv.status === "OVERDUE"
                          ? "text-destructive"
                          : ""
                      )}
                    >
                      {inv.status}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Earnings by Staff</CardTitle>
            <CardDescription>
              How much each team member earned and from which clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Total Earned</TableHead>
                  <TableHead>Clients (top)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earningsByStaff.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-bold">{m.name}</TableCell>
                    <TableCell>{m.role}</TableCell>
                    <TableCell className="text-right">
                      ₹{Number(m.total || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {Object.entries(m.clients || {})
                        .sort((a, b) => (b[1] as number) - (a[1] as number))
                        .slice(0, 3)
                        .map(([cName, amt]) => (
                          <div key={cName} className="text-sm">
                            {cName}: ₹{Number(amt).toLocaleString()}
                          </div>
                        ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>
              All invoices with payment received and due amounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Payment Received</TableHead>
                  <TableHead className="text-right">Due Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => {
                  const paid =
                    Number(
                      inv.paidAmount ?? (inv.status === "PAID" ? inv.amount : 0)
                    ) || 0;
                  const due = Math.max(0, Number(inv.amount || 0) - paid);
                  return (
                    <TableRow key={inv._id ?? inv.id}>
                      <TableCell className="font-bold">
                        {inv._id ?? inv.id}
                      </TableCell>
                      <TableCell>
                        {inv.clientName ||
                          inv.client ||
                          clients.find(
                            (c) =>
                              String(c._id ?? c.id) === String(inv.clientId)
                          )?.name ||
                          "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{Number(inv.amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{paid.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{due.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
