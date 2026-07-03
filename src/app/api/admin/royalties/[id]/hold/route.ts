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

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await adminSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;

  const statement = await prisma.royaltyStatement.findUnique({
    where: { id },
    select: { id: true, status: true, authorId: true },
  });

  if (!statement) {
    return NextResponse.json({ error: 'Statement not found' }, { status: 404 });
  }

  await prisma.royaltyStatement.update({
    where: { id },
    data: { status: 'HELD' },
  });

  await prisma.payoutAuditLog.create({
    data: {
      adminId: session.user.id,
      action: 'HOLD',
      payoutId: null,
      metadata: {
        before: { status: statement.status },
        after: { status: 'HELD' },
        statementId: id,
        authorId: statement.authorId,
      },
    },
  });

  return NextResponse.json({ success: true });
}
