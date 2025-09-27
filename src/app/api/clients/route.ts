(async () => {})();
import { NextResponse } from 'next/server';
import * as svc from '@/lib/services';

export async function GET() {
	try {
		const items = await svc.getClients();
		return NextResponse.json(items);
	} catch (e: any) {
		return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const created = await svc.createClient(body);
		return NextResponse.json(created, { status: 201 });
	} catch (e: any) {
		return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
	}
}

