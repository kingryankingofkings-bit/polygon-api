import 'server-only';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdminApi } from '@/lib/require-admin-api';
import { ManuscriptStatus } from '@prisma/client';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminApi();
  } catch (res) {
    return res as Response;
  }

  try {
    const { id } = await params;
    const body = await req.json();
    
    // Allow updating status and publishedUrl
    const dataToUpdate: any = {};
    if (body.status && Object.values(ManuscriptStatus).includes(body.status)) {
      dataToUpdate.status = body.status;
    }
    if (body.publishedUrl !== undefined) {
      dataToUpdate.publishedUrl = body.publishedUrl;
    }
    if (body.status === 'PUBLISHED' && !dataToUpdate.publishedAt) {
      dataToUpdate.publishedAt = new Date();
    }

    const manuscript = await prisma.manuscript.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ manuscript });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update manuscript' }, { status: 500 });
  }
}
