
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { stats, projects, invoices, leads, quotations, services } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Pie, PieChart, Cell } from "recharts";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const chartData = [
  { month: 'Jan', revenue: 4000 },
  { month: 'Feb', revenue: 3000 },
  { month: 'Mar', revenue: 5000 },
  { month: 'Apr', revenue: 4500 },
  { month: 'May', revenue: 6000 },
  { month: 'Jun', revenue: 8000 },
];

const projectStatusCounts = projects.reduce((acc, project) => {
  const status = project.status || 'BACKLOG';
  acc[status] = (acc[status] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const projectChartData = Object.keys(projectStatusCounts).map(status => ({
  status,
  count: projectStatusCounts[status],
  fill: `hsl(var(--chart-${Object.keys(projectStatusCounts).indexOf(status) + 1}))`
}));

const projectChartConfig = {
  count: {
    label: "Projects",
  },
  "BACKLOG": { label: "Backlog", color: "hsl(var(--chart-1))" },
  "IN PROGRESS": { label: "In Progress", color: "hsl(var(--chart-2))" },
  "IN REVIEW": { label: "In Review", color: "hsl(var(--chart-3))" },
  "COMPLETED": { label: "Completed", color: "hsl(var(--chart-4))" },
};

const leadsByStatus = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
}, {} as Record<string, number>);

const serviceUsageCounts = quotations
  .filter(q => q.status === 'APPROVED')
  .flatMap(q => q.services)
  .reduce((acc, service) => {
    acc[service.name] = (acc[service.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

const serviceChartData = Object.entries(serviceUsageCounts)
    .map(([service, count]) => ({ service, count }))
    .sort((a, b) => b.count - a.count);


export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-8 font-headline">
      <header>
        <h1 className="text-5xl font-black tracking-tighter">DASHBOARD</h1>
        <p className="text-muted-foreground text-lg">Real-time pulse of your agency.</p>
      </header>

      {isAdmin ? (
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="overview" className="h-12 text-lg">Overview</TabsTrigger>
            <TabsTrigger value="revenue" className="h-12 text-lg">Revenue</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8 mt-8">
             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.name} className="border-2 border-black">
                    <CardHeader>
                        <CardTitle className="text-base font-bold text-muted-foreground tracking-widest">{stat.name.toUpperCase()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-5xl font-black tracking-tighter">{stat.value}</p>
                        <p className={cn(
                        "text-sm font-bold",
                        stat.changeType === 'positive' && 'text-success',
                        stat.changeType === 'negative' && 'text-destructive',
                        )}>{stat.change}</p>
                    </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-2 border-black">
                    <CardHeader>
                        <CardTitle className="text-2xl font-black tracking-tighter">Recent Invoices</CardTitle>
                        <CardDescription>A quick look at the latest billing activity.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice ID</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.slice(0, 4).map(invoice => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-bold">{invoice.id}</TableCell>
                                        <TableCell>{invoice.client}</TableCell>
                                        <TableCell>₹{invoice.amount.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-bold">{invoice.status}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card className="border-2 border-black">
                    <CardHeader>
                        <CardTitle className="text-2xl font-black tracking-tighter">Leads Pipeline</CardTitle>
                         <CardDescription>Current status of all leads.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.entries(leadsByStatus).map(([status, count]) => (
                            <div key={status} className="flex justify-between items-center bg-muted p-3">
                                <span className="font-bold text-muted-foreground text-lg">{status}</span>
                                <span className="font-black text-3xl">{count}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <Card className="lg:col-span-2 border-2 border-black">
                    <CardHeader>
                        <CardTitle className="text-2xl font-black tracking-tighter">MONTHLY REVENUE</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--foreground))" opacity={0.2} />
                            <XAxis dataKey="month" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-black flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-2xl font-black tracking-tighter">Project Status</CardTitle>
                        <CardDescription>Distribution of current projects.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex items-center justify-center">
                        <ChartContainer config={projectChartConfig} className="mx-auto aspect-square h-[250px]">
                            <PieChart>
                                <Pie data={projectChartData} dataKey="count" nameKey="status" innerRadius={60} strokeWidth={5}>
                                    {projectChartData.map((entry) => (
                                        <Cell key={entry.status} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
            
            <Card className="border-2 border-black">
                <CardHeader>
                    <CardTitle className="text-2xl font-black tracking-tighter">Top Services</CardTitle>
                    <CardDescription>Which services are bringing in the most business.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={serviceChartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--foreground))" opacity={0.2} />
                                <XAxis type="number" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis type="category" dataKey="service" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} width={120} />
                                <Bar dataKey="count" name="Projects" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

          </TabsContent>
        </Tabs>
      ) : (
        <Card className="border-2 border-black">
            <CardHeader>
                <CardTitle className="text-2xl font-black tracking-tighter">Welcome, {user?.name}!</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-lg">This is your dashboard. You can manage your assigned projects and tasks from here.</p>
                <p className="text-lg mt-4">Check the <Link href="/projects" className="font-bold underline">Projects</Link> page to see what's on your plate.</p>
            </CardContent>
        </Card>
      )}

    </div>
  )
}

    