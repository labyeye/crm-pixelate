import { NextRequest, NextResponse } from 'next/server';
import * as svc from '@/lib/services';

export async function GET() {
  try {
    const quotations = await svc.getQuotations();
    return NextResponse.json(quotations);
  } catch (error: any) {
    console.error('Error fetching quotations:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch quotations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const quotationData = await request.json();
    const newQuotation = await svc.createQuotation(quotationData);
    return NextResponse.json(newQuotation, { status: 201 });
  } catch (error: any) {
    console.error('Error creating quotation:', error);
    return NextResponse.json({ error: error.message || 'Failed to create quotation' }, { status: 500 });
  }
}