import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { stats } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";


const chartData = [
  { month: 'Jan', revenue: 4000 },
  { month: 'Feb', revenue: 3000 },
  { month: 'Mar', revenue: 5000 },
  { month: 'Apr', revenue: 4500 },
  { month: 'May', revenue: 6000 },
  { month: 'Jun', revenue: 8000 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 font-headline">
      <header>
        <h1 className="text-5xl font-black tracking-tighter">DASHBOARD</h1>
        <p className="text-muted-foreground text-lg">Real-time pulse of your agency.</p>
      </header>

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

      <Card className="border-2 border-black">
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
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
