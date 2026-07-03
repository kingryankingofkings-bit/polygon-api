import 'server-only';
import { NextResponse } from 'next/server';
import { CurrentStatusSchema } from '@/lib/contracts/royalty';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/require-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await requireAuth(req);

  const author = await prisma.author.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!author) {
    return NextResponse.json({ error: 'Author not found' }, { status: 404 });
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const statements = await prisma.royaltyStatement.findMany({
    where: {
      authorId: author.id,
      periodYear: currentYear,
      periodMonth: currentMonth,
    },
    select: {
      id: true,
      status: true,
      totalRoyalty: true,
    },
  });

  const breakdown = { pending: 0, calculated: 0, approved: 0, paid: 0, held: 0 };
  let totalPendingPayout = 0;

  for (const s of statements) {
    const amount = s.totalRoyalty / 100;
    if (s.status === 'PENDING') breakdown.pending += amount;
    else if (s.status === 'CALCULATED') breakdown.calculated += amount;
    else if (s.status === 'APPROVED') breakdown.approved += amount;
    else if (s.status === 'PAID') breakdown.paid += amount;
    else if (s.status === 'HELD') breakdown.held += amount;

    if (s.status !== 'PAID') {
      totalPendingPayout += amount;
    }
  }

  const result = CurrentStatusSchema.parse({
    currentMonth,
    currentYear,
    breakdown,
    totalPendingPayout,
  });

  return NextResponse.json(result);
}
