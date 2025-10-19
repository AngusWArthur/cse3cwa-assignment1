import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

type IncomingTab = { id: number; title: string; content: string };

export async function GET() {
  const rows = await prisma.tabSet.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (
    !body ||
    typeof body.title !== 'string' ||
    typeof body.html !== 'string' ||
    !Array.isArray(body.tabs)
  ) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const ok = (body.tabs as IncomingTab[]).every(
    (t) =>
      typeof t.id === 'number' &&
      typeof t.title === 'string' &&
      typeof t.content === 'string'
  );
  if (!ok) return NextResponse.json({ error: 'Invalid tabs array' }, { status: 400 });

  const row = await prisma.tabSet.create({
    data: {
      title: body.title.trim() || 'Untitled',
      tabs: body.tabs,
      html: body.html, // schema expects string (not null)
    },
  });

  return NextResponse.json(row, { status: 201 });
}
