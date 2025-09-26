import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { leads, leadStatuses } from "@/lib/data";

export default function LeadsPage() {
  return (
    <div className="space-y-8 font-headline">
      <header>
        <h1 className="text-5xl font-black tracking-tighter">LEAD MANAGEMENT</h1>
        <p className="text-muted-foreground text-lg">Track and manage potential clients from new to closed.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {leadStatuses.map(status => (
          <div key={status} className="space-y-4">
            <h2 className="text-2xl font-black tracking-tighter p-2 border-2 border-black bg-muted text-center">
              {status}
            </h2>
            <div className="space-y-4">
              {leads.filter(lead => lead.status === status).map(lead => (
                <Card key={lead.id} className="border-4 border-black bg-white cursor-pointer group hover:bg-foreground">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold tracking-tight group-hover:text-background">{lead.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground group-hover:text-background/80">{lead.project}</p>
                    <p className="mt-4 text-2xl font-black group-hover:text-background">₹{lead.value.toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
