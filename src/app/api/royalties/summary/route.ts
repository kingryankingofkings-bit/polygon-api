import 'server-only';
import { NextResponse } from 'next/server';
import { RoyaltySummarySchema } from '@/lib/contracts/royalty';
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

  const [totalEarningsResult, publishedCount, currentStatement] = await Promise.all([
    prisma.bookSale.aggregate({
      where: { authorId: author.id },
      _sum: { royaltyAmount: true },
    }),
    prisma.manuscript.count({
      where: { authorId: author.id, status: 'PUBLISHED' },
    }),
    prisma.royaltyStatement.findFirst({
      where: {
        authorId: author.id,
        periodYear: currentYear,
        periodMonth: currentMonth,
      },
    }),
  ]);

  const totalEarnings = totalEarningsResult._sum.royaltyAmount ?? 0;
  const pendingPayout = currentStatement?.totalRoyalty ?? 0;

  const currentMonthStatus = currentStatement
    ? await prisma.royaltyStatement.aggregate({
        where: {
          authorId: author.id,
          periodYear: currentYear,
          periodMonth: currentMonth,
        },
        _sum: { totalRoyalty: true },
      })
    : null;

  const breakdown = { pending: 0, calculated: 0, paid: 0, held: 0 };

  if (currentMonthStatus) {
    const statement = currentStatement;
    if (statement) {
      breakdown[
        statement.status === 'PENDING'
          ? 'pending'
          : statement.status === 'CALCULATED'
            ? 'calculated'
            : statement.status === 'PAID'
              ? 'paid'
              : 'held'
      ] = statement.totalRoyalty;
    }
  }

  const result = RoyaltySummarySchema.parse({
    totalEarnings: totalEarnings / 100,
    pendingPayout: pendingPayout / 100,
    publishedTitles: publishedCount,
    currentMonthStatus: breakdown,
  });

  return NextResponse.json(result);
}
