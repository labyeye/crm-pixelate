import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { quotations } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function QuotationsPage() {
  return (
    <div className="space-y-8 font-headline">
      <header>
        <h1 className="text-5xl font-black tracking-tighter">QUOTATIONS</h1>
        <p className="text-muted-foreground text-lg">Create, send, and track client quotations.</p>
      </header>

      <div className="space-y-8">
        {quotations.map((quote) => (
          <Card key={quote.id} className="border-4 border-black">
            <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-3xl font-black tracking-tighter">{quote.id}</CardTitle>
                <p className="text-lg text-muted-foreground font-bold">{quote.client}</p>
              </div>
              <div className={cn("text-2xl font-black p-2 mt-2 sm:mt-0",
                quote.status === 'APPROVED' && 'bg-success text-success-foreground',
                quote.status === 'REJECTED' && 'bg-destructive text-destructive-foreground',
                quote.status === 'PENDING' && 'bg-accent text-accent-foreground'
              )}>
                {quote.status}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator className="border-t-2 border-black" />
              <div>
                <h3 className="text-base font-bold text-muted-foreground tracking-widest">SERVICES</h3>
                <ul className="text-lg font-bold list-none mt-2 space-y-1">
                  {quote.services.map(service => <li key={service}>- {service}</li>)}
                </ul>
              </div>
              <Separator className="border-t-2 border-black" />
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-muted-foreground tracking-widest">TOTAL</h3>
                <p className="text-4xl font-black">₹{quote.amount.toLocaleString()}</p>
              </div>
            </CardContent>
            {quote.status === 'PENDING' && (
              <>
                <Separator className="border-t-2 border-black" />
                <CardFooter className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button variant="destructive" className="text-xl h-16">REJECT</Button>
                  <Button className="text-xl h-16 bg-success text-success-foreground hover:bg-success/90">CONFIRM</Button>
                </CardFooter>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
