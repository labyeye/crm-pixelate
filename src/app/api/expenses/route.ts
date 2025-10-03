import { NextRequest, NextResponse } from 'next/server';
import * as svc from '@/lib/services';

export async function GET() {
  try {
    const col = await svc.getCollection('expenses');
    const items = await col.find().toArray();
    return NextResponse.json(items);
  } catch (e: any) {
    console.error('Error fetching expenses', e);
    return NextResponse.json({ error: e.message || 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const col = await svc.getCollection('expenses');
    const res = await col.insertOne({ ...body, createdAt: new Date() });
    return NextResponse.json({ ...body, _id: res.insertedId }, { status: 201 });
  } catch (e: any) {
    console.error('Error creating expense', e);
    return NextResponse.json({ error: e.message || 'Failed to create expense' }, { status: 500 });
  }
}
