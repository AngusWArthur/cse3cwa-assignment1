import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';

export const runtime = 'nodejs';

type RouteContext = { params: { id: string } };

type IncomingTab = { id: number; title: string; content: string };
function isIncomingTabArray(v: unknown): v is IncomingTab[] {
  return Array.isArray(v) && v.every((t: unknown) => {
    if (typeof t !== 'object' || t === null) return false;
    const o = t as { id: unknown; title: unknown; content: unknown };
    return typeof o.id === 'number' &&
           typeof o.title === 'string' &&
           typeof o.content === 'string';
  });
}

export async function GET(_req: Request, { params }: RouteContext) {
  const row = await prisma.tabSet.findUnique({ where: { id: params.id } });
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(row);
}

type PutBody = Partial<{ title: string; tabs: unknown; html: string }>;

export async function PUT(req: Request, { params }: RouteContext) {
  const body = (await req.json().catch(() => ({}))) as PutBody;

  const updates: Prisma.TabSetUpdateInput = {};

  if (typeof body.title === 'string') updates.title = body.title.trim();

  if (body.tabs !== undefined) {
    if (!isIncomingTabArray(body.tabs)) {
      return NextResponse.json({ error: 'Invalid tabs array' }, { status: 400 });
    }
    updates.tabs = body.tabs as unknown as Prisma.InputJsonValue;
  }

  if (typeof body.html === 'string') updates.html = body.html;

  try {
    const row = await prisma.tabSet.update({ where: { id: params.id }, data: updates });
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    await prisma.tabSet.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
