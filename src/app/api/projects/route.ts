(async () => {})();
import { NextResponse } from 'next/server';
import * as svc from '@/lib/services';

export async function GET() {
	try {
		const col = await svc.getCollection('projects');
		const items = await col.find().toArray();
		return NextResponse.json(items);
	} catch (e: any) {
		return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const col = await svc.getCollection('projects');
		const res = await col.insertOne({ ...body, createdAt: new Date() });
		// create an invoice record so dashboard revenue reflects this project
		try {
			await svc.createInvoice({ projectId: String(res.insertedId), title: body.title, amount: body.amount, createdAt: new Date() });
		} catch (e) {
			console.error('Failed to create linked invoice', e);
		}
		return NextResponse.json({ ...body, _id: res.insertedId }, { status: 201 });
	} catch (e: any) {
		return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
	}
}

