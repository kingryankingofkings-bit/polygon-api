import 'server-only';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function adminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== 'admin') {
    return null;
  }
  return session;
}

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await adminSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const adminId = session.user.id;

  const { searchParams } = new URL(req.url);
  const periodYear = searchParams.get('periodYear');
  const periodMonth = searchParams.get('periodMonth');

  if (!periodYear || !periodMonth) {
    return NextResponse.json(
      { error: 'periodYear and periodMonth query params are required' },
      { status: 400 },
    );
  }

  const year = parseInt(periodYear, 10);
  const month = parseInt(periodMonth, 10);

  if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: 'Invalid year or month' }, { status: 400 });
  }

  const statements = await prisma.royaltyStatement.findMany({
    where: { periodYear: year, periodMonth: month },
    orderBy: { authorId: 'asc' },
  });

  const authorIds = [...new Set(statements.map((s) => s.authorId))];

  const authors = await prisma.author.findMany({
    where: { id: { in: authorIds } },
    select: { id: true, penName: true },
  });

  const authorMap = new Map(authors.map((a) => [a.id, a]));

  const header = [
    'Author',
    'Period',
    'Gross Sales',
    'Processor Fees',
    'Platform Fees',
    'Refunds',
    'Chargebacks',
    'Net Revenue',
    'Royalty',
    'Status',
  ].join(',');

  const rows = statements.map((s) => {
    const author = authorMap.get(s.authorId);
    return [
      `"${author?.penName ?? 'Unknown'}"`,
      `${s.periodYear}-${String(s.periodMonth).padStart(2, '0')}`,
      (s.totalGrossSales / 100).toFixed(2),
      (s.totalProcessorFees / 100).toFixed(2),
      (s.totalPlatformFees / 100).toFixed(2),
      (s.totalRefunds / 100).toFixed(2),
      (s.totalChargebacks / 100).toFixed(2),
      (s.totalNetRevenue / 100).toFixed(2),
      (s.totalRoyalty / 100).toFixed(2),
      s.status,
    ].join(',');
  });

  const csv = [header, ...rows].join('\n');

  await prisma.payoutAuditLog.create({
    data: {
      adminId: adminId,
      action: 'EXPORT',
      payoutId: null,
      metadata: { periodYear: year, periodMonth: month, rows: statements.length },
    },
  });

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="royalties-${periodYear}-${String(periodMonth).padStart(2, '0')}.csv"`,
    },
  });
}
