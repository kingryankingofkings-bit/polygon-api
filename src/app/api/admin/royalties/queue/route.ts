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

export async function GET(_req: Request) {
  const session = await adminSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const queue = await prisma.royaltyStatement.findMany({
    where: {
      status: { in: ['PENDING', 'CALCULATED', 'APPROVED', 'HELD'] },
    },
    orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
  });

  const authorIds = [...new Set(queue.map((s) => s.authorId))];

  const authors = await prisma.author.findMany({
    where: { id: { in: authorIds } },
    select: {
      id: true,
      penName: true,
      payoutPayPal: true,
      payoutStripe: true,
    },
  });

  const authorMap = new Map(authors.map((a) => [a.id, a]));

  const payoutRecords = await prisma.payoutRecord.findMany({
    where: { statementId: { in: queue.map((s) => s.id) } },
    orderBy: { createdAt: 'desc' },
  });

  const payoutsByStatement = new Map<string, typeof payoutRecords>();
  for (const p of payoutRecords) {
    const existing = payoutsByStatement.get(p.statementId) ?? [];
    existing.push(p);
    payoutsByStatement.set(p.statementId, existing);
  }

  const result = {
    data: queue.map((s) => {
      const author = authorMap.get(s.authorId);
      const payouts = payoutsByStatement.get(s.id) ?? [];

      let payoutHint: { type: 'email'; value: string } | { type: 'account'; value: string } | null =
        null;
      let payoutMethod: 'PAYPAL' | 'STRIPE' | null = null;

      if (author?.payoutPayPal) {
        payoutMethod = 'PAYPAL';
        const email = author.payoutPayPal;
        const parts = email.split('@');
        const local = parts[0] ?? '';
        const domain = parts[1] ?? '';
        payoutHint = { type: 'email', value: `${local.slice(0, 2)}***@${domain}` };
      } else if (author?.payoutStripe) {
        payoutMethod = 'STRIPE';
        const acct = author.payoutStripe;
        payoutHint = { type: 'account', value: `acct_••••${acct.slice(-4)}` };
      }

      return {
        id: s.id,
        authorId: s.authorId,
        authorName: author?.penName ?? 'Unknown',
        periodYear: s.periodYear,
        periodMonth: s.periodMonth,
        totalRoyalty: s.totalRoyalty / 100,
        status: s.status,
        payoutMethod,
        payoutHint,
        payouts: payouts.map((p) => ({
          id: p.id,
          amount: p.amount / 100,
          method: p.method,
          transactionId: p.transactionId,
          status: p.status,
          processedAt: p.processedAt?.toISOString() ?? null,
          payoutEmailHint: p.payoutEmailHint,
          payoutAccountHint: p.payoutAccountHint,
        })),
      };
    }),
  };

  return NextResponse.json(result);
}
