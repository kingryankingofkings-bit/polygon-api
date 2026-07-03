import 'server-only';
import { NextResponse } from 'next/server';
import { StatementDetailSchema } from '@/lib/contracts/royalty';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/require-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  const { id } = await params;

  const author = await prisma.author.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!author) {
    return NextResponse.json({ error: 'Author not found' }, { status: 404 });
  }

  const statement = await prisma.royaltyStatement.findFirst({
    where: { id, authorId: author.id },
  });

  if (!statement) {
    return NextResponse.json({ error: 'Statement not found' }, { status: 404 });
  }

  const [sales, payoutRecords, manuscripts] = await Promise.all([
    prisma.bookSale.findMany({
      where: {
        authorId: author.id,
        transactionDate: {
          gte: new Date(statement.periodYear, statement.periodMonth - 1, 1),
          lt: new Date(statement.periodYear, statement.periodMonth, 1),
        },
      },
      orderBy: { transactionDate: 'desc' },
    }),
    prisma.payoutRecord.findMany({
      where: { statementId: id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.manuscript.findMany({
      where: { authorId: author.id },
      select: { id: true, title: true },
    }),
  ]);

  const manuscriptMap = new Map(manuscripts.map((m) => [m.id, m.title]));

  const result = StatementDetailSchema.parse({
    id: statement.id,
    periodYear: statement.periodYear,
    periodMonth: statement.periodMonth,
    totalGrossSales: statement.totalGrossSales / 100,
    totalProcessorFees: statement.totalProcessorFees / 100,
    totalPlatformFees: statement.totalPlatformFees / 100,
    totalRefunds: statement.totalRefunds / 100,
    totalChargebacks: statement.totalChargebacks / 100,
    totalNetRevenue: statement.totalNetRevenue / 100,
    totalRoyalty: statement.totalRoyalty / 100,
    status: statement.status,
    sales: sales.map((s) => ({
      id: s.id,
      bookId: s.bookId,
      title: manuscriptMap.get(s.bookId) ?? 'Unknown',
      grossAmount: s.grossAmount / 100,
      processorFee: s.processorFee / 100,
      platformFee: s.platformFee / 100,
      refundAmount: s.refundAmount / 100,
      chargebackAmount: s.chargebackAmount / 100,
      netAmount: s.netAmount / 100,
      royaltyAmount: s.royaltyAmount / 100,
      transactionDate: s.transactionDate.toISOString(),
      transactionId: s.transactionId,
      type: s.type,
    })),
    payoutRecords: payoutRecords.map((p) => ({
      amount: p.amount / 100,
      method: p.method,
      transactionId: p.transactionId,
      status: p.status,
      processedAt: p.processedAt?.toISOString() ?? null,
      payoutEmailHint: p.payoutEmailHint,
      payoutAccountHint: p.payoutAccountHint,
    })),
    createdAt: statement.createdAt.toISOString(),
    updatedAt: statement.updatedAt.toISOString(),
  });

  return NextResponse.json(result);
}
