import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

type IncomingTab = { id: number; title: string; content: string };

export async function GET() {
  const t0 = Date.now();
  try {
    const rows = await prisma.tabSet.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const dur = Date.now() - t0;
    const res = NextResponse.json(rows);
    res.headers.set('Server-Timing', `app;dur=${dur}`);
    return res;
  } catch (err) {
    console.error('[tabsets.GET] Error:', err);
    (globalThis as any).__log?.(
      `ERR /api/tabsets GET ${(err as Error)?.message ?? String(err)}`
    );
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  } finally {
    (globalThis as any).__log?.(`GET /api/tabsets ${Date.now() - t0}ms`);
  }
}

export async function POST(req: Request) {
  const t0 = Date.now();
  try {
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
    if (!ok) {
      return NextResponse.json({ error: 'Invalid tabs array' }, { status: 400 });
    }

    const row = await prisma.tabSet.create({
      data: {
        title: body.title.trim() || 'Untitled',
        tabs: body.tabs, // JSON column
        html: body.html, // string column
      },
    });

    const dur = Date.now() - t0;
    const res = NextResponse.json(row, { status: 201 });
    res.headers.set('Server-Timing', `app;dur=${dur}`);
    return res;
  } catch (err) {
    console.error('[tabsets.POST] Error:', err);
    (globalThis as any).__log?.(
      `ERR /api/tabsets POST ${(err as Error)?.message ?? String(err)}`
    );
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  } finally {
    (globalThis as any).__log?.(`POST /api/tabsets ${Date.now() - t0}ms`);
  }
}