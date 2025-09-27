import { NextRequest, NextResponse } from 'next/server';
import * as svc from '@/lib/services';

export async function GET() {
  try {
    const invoices = await svc.getInvoices();
    return NextResponse.json(invoices);
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const invoiceData = await request.json();
    // fallback: insert directly into collection
    const col = await svc.getCollection('invoices');
    const res = await col.insertOne({ ...invoiceData, createdAt: new Date() });
    return NextResponse.json({ ...invoiceData, _id: res.insertedId }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: error.message || 'Failed to create invoice' }, { status: 500 });
  }
}