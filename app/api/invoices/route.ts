import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const invoices = await db.invoices.list();
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const invoice = await db.invoices.create(data);
    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
