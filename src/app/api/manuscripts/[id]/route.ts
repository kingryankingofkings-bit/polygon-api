// @app:user-owned — Single manuscript operations (GET, PATCH, DELETE).
import 'server-only';
import { NextResponse } from 'next/server';
import { ManuscriptPublicSchema, ManuscriptUpdateSchema } from '@/lib/contracts/manuscript';
import { prisma } from '@/lib/db';
import { requireAuth, type SessionUser } from '@/lib/require-auth';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, context: RouteContext) {
  let user: SessionUser;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  try {
    const { id } = await context.params;

    const author = await prisma.author.findUnique({
      where: { userId: user.id },
    });

    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    const manuscript = await prisma.manuscript.findFirst({
      where: { id, authorId: author.id },
    });

    if (!manuscript) {
      return NextResponse.json({ error: 'Manuscript not found' }, { status: 404 });
    }

    return NextResponse.json(ManuscriptPublicSchema.parse(manuscript));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  let user: SessionUser;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => null);
    const parsed = ManuscriptUpdateSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const [field, messages] of Object.entries(parsed.error.flatten().fieldErrors)) {
        const message = messages?.[0];
        if (message) fieldErrors[field] = message;
      }
      return NextResponse.json({ errors: fieldErrors }, { status: 400 });
    }

    const author = await prisma.author.findUnique({
      where: { userId: user.id },
    });

    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    const existing = await prisma.manuscript.findFirst({
      where: { id, authorId: author.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Manuscript not found' }, { status: 404 });
    }

    const updated = await prisma.manuscript.update({
      where: { id },
      data: parsed.data,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        authorId: author.id,
        manuscriptId: id,
        action: 'STATUS_CHANGED',
        resource: 'Manuscript',
        resourceId: id,
        metadata: { updatedFields: Object.keys(parsed.data) },
        ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
      },
    });

    return NextResponse.json(ManuscriptPublicSchema.parse(updated));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  let user: SessionUser;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  try {
    const { id } = await context.params;

    const author = await prisma.author.findUnique({
      where: { userId: user.id },
    });

    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    const manuscript = await prisma.manuscript.findFirst({
      where: { id, authorId: author.id },
    });

    if (!manuscript) {
      return NextResponse.json({ error: 'Manuscript not found' }, { status: 404 });
    }

    // Only allow delete if not yet published
    if (manuscript.status === 'PUBLISHED') {
      return NextResponse.json({ error: 'Cannot delete a published manuscript' }, { status: 403 });
    }

    await prisma.manuscript.delete({ where: { id } });

    // Audit log
    await prisma.auditLog.create({
      data: {
        authorId: author.id,
        manuscriptId: id,
        action: 'MANUSCRIPT_DELETED',
        resource: 'Manuscript',
        resourceId: id,
        metadata: { title: manuscript.title },
        ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
