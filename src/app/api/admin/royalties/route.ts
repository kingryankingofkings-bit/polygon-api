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

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor') ?? undefined;
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);

  const statements = await prisma.royaltyStatement.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
  });

  const authors = await prisma.author.findMany({
    where: {
      id: { in: statements.map((s) => s.authorId) },
    },
    select: { id: true, penName: true },
  });

  const authorMap = new Map(authors.map((a) => [a.id, a]));

  const hasMore = statements.length > limit;
  const items = hasMore ? statements.slice(0, limit) : statements;
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;

  const result = {
    data: items.map((s) => {
      const author = authorMap.get(s.authorId);
      return {
        id: s.id,
        authorId: s.authorId,
        authorName: author?.penName ?? 'Unknown',
        periodYear: s.periodYear,
        periodMonth: s.periodMonth,
        totalGrossSales: s.totalGrossSales / 100,
        totalProcessorFees: s.totalProcessorFees / 100,
        totalPlatformFees: s.totalPlatformFees / 100,
        totalRefunds: s.totalRefunds / 100,
        totalChargebacks: s.totalChargebacks / 100,
        totalNetRevenue: s.totalNetRevenue / 100,
        totalRoyalty: s.totalRoyalty / 100,
        status: s.status,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      };
    }),
    nextCursor,
  };

  return NextResponse.json(result);
}
