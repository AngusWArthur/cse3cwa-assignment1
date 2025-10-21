// src/app/api/tabsets/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export const runtime = 'nodejs';

// Next 15: params is a Promise<{ id: string }>
type ParamCtx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: ParamCtx) {
  const { id } = await ctx.params;

  const row = await prisma.tabSet.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(row);
}

export async function PUT(req: Request, ctx: ParamCtx) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({} as Record<string, unknown>));

  // Build a typed, partial update payload
  const data: { title?: string; tabs?: Prisma.InputJsonValue; html?: string } = {};

  if (typeof body.title === 'string') data.title = body.title.trim();
  if (Array.isArray(body.tabs)) data.tabs = body.tabs as Prisma.InputJsonValue;
  if (typeof body.html === 'string') data.html = body.html;

  try {
    const row = await prisma.tabSet.update({ where: { id }, data });
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function DELETE(_req: Request, ctx: ParamCtx) {
  const { id } = await ctx.params;

  try {
    await prisma.tabSet.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
