import 'server-only';
import { NextResponse } from 'next/server';
import { BookSalesSchema } from '@/lib/contracts/royalty';
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

  const publishedManuscripts = await prisma.manuscript.findMany({
    where: { authorId: author.id, status: 'PUBLISHED' },
    select: { id: true, title: true, genre: true },
  });

  const bookIds = publishedManuscripts.map((m) => m.id);

  const salesAggregates = await prisma.bookSale.groupBy({
    by: ['bookId'],
    where: { authorId: author.id, bookId: { in: bookIds } },
    _sum: {
      grossAmount: true,
      processorFee: true,
      platformFee: true,
      refundAmount: true,
      chargebackAmount: true,
      netAmount: true,
      royaltyAmount: true,
    },
  });

  const currentMonthAggregates = await prisma.bookSale.groupBy({
    by: ['bookId'],
    where: {
      authorId: author.id,
      bookId: { in: bookIds },
      transactionDate: {
        gte: new Date(currentYear, currentMonth - 1, 1),
        lt: new Date(currentYear, currentMonth, 1),
      },
    },
    _sum: {
      royaltyAmount: true,
    },
  });

  type SaleAgg = (typeof salesAggregates)[number]['_sum'];
  const currentMonthMap = new Map<string, number>(
    currentMonthAggregates.map((a) => [a.bookId, a._sum.royaltyAmount ?? 0]),
  );
  const salesMap = new Map<string, SaleAgg>(salesAggregates.map((a) => [a.bookId, a._sum]));

  const emptyAgg: SaleAgg = {} as SaleAgg;
  const result = BookSalesSchema.array().parse(
    publishedManuscripts.map((m) => {
      const agg = salesMap.get(m.id) ?? emptyAgg;
      const thisMonthRoyalty = currentMonthMap.get(m.id) ?? 0;
      return {
        bookId: m.id,
        title: m.title,
        genre: m.genre,
        gross: (agg.grossAmount ?? 0) / 100,
        processorFee: (agg.processorFee ?? 0) / 100,
        platformFee: (agg.platformFee ?? 0) / 100,
        refunds: (agg.refundAmount ?? 0) / 100,
        chargebacks: (agg.chargebackAmount ?? 0) / 100,
        net: (agg.netAmount ?? 0) / 100,
        royalty: (agg.royaltyAmount ?? 0) / 100,
        thisMonthPayout: thisMonthRoyalty / 100,
      };
    }),
  );

  return NextResponse.json(result);
}
