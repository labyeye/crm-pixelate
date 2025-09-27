import { NextRequest, NextResponse } from 'next/server';
import * as svc from '@/lib/services';

export async function GET() {
  try {
    const tickets = await svc.getCollection('supportTickets').then((c:any)=>c.find().toArray());
    return NextResponse.json(tickets);
  } catch (error: any) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch support tickets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ticketData = await request.json();
    const col = await svc.getCollection('supportTickets');
    const res = await col.insertOne({ ...ticketData, createdAt: new Date() });
    return NextResponse.json({ ...ticketData, _id: res.insertedId }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating support ticket:', error);
    return NextResponse.json({ error: error.message || 'Failed to create support ticket' }, { status: 500 });
  }
}