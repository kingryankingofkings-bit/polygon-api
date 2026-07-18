import 'server-only';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdminApi } from '@/lib/require-admin-api';

export async function GET() {
  try {
    await requireAdminApi();
  } catch (res) {
    return res as Response;
  }

  try {
    const manuscripts = await prisma.manuscript.findMany({
      include: {
        author: {
          select: {
            id: true,
            penName: true,
            legalName: true,
            userId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ manuscripts });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch manuscripts' }, { status: 500 });
  }
}
