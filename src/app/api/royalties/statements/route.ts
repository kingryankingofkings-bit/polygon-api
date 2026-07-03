import 'server-only';
import { NextResponse } from 'next/server';
import { StatementListSchema } from '@/lib/contracts/royalty';
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

  const statements = await prisma.royaltyStatement.findMany({
    where: { authorId: author.id },
    orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
    select: {
      id: true,
      periodYear: true,
      periodMonth: true,
      totalRoyalty: true,
      status: true,
    },
  });

  const result = StatementListSchema.array().parse(statements);

  return NextResponse.json(result);
}
