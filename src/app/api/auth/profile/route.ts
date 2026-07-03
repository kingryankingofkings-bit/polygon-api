// @app:user-owned — Author profile read/update. Payout data is NEVER returned.
import 'server-only';
import { NextResponse } from 'next/server';
import { UpdateAuthorProfileSchema } from '@/lib/contracts/auth';
import { prisma } from '@/lib/db';
import { requireAuth, type SessionUser } from '@/lib/require-auth';

export const dynamic = 'force-dynamic';

// GET /api/auth/profile — get current author's profile (public fields only)
export async function GET(req: Request) {
  let user: SessionUser;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  try {
    const author = await prisma.author.findUnique({
      where: { userId: user.id },
    });

    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    // Return ONLY public fields — never payout data
    return NextResponse.json({
      id: author.id,
      penName: author.penName,
      bio: author.bio,
      genrePrefs: author.genrePrefs,
      createdAt: author.createdAt,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH /api/auth/profile — update author profile
export async function PATCH(req: Request) {
  let user: SessionUser;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  try {
    const body = await req.json().catch(() => null);
    const parsed = UpdateAuthorProfileSchema.safeParse(body);

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

    const updated = await prisma.author.update({
      where: { id: author.id },
      data: parsed.data,
      select: {
        id: true,
        penName: true,
        bio: true,
        genrePrefs: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
