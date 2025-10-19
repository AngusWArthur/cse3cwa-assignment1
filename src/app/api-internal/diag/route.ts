import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
// Optional: ensure it never gets statically cached
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const count = await prisma.tabSet.count();
    return NextResponse.json({ ok: true, tabSetCount: count });
  } catch (err) {
    console.error('[diag] Prisma error:', err);
    return NextResponse.json(
      { ok: false, error: String((err as Error)?.message || err) },
      { status: 500 }
    );
  }
}
