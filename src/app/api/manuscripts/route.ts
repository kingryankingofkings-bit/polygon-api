// @app:user-owned — Manuscript CRUD endpoints. All queries scoped by authorId.
import 'server-only';
import { NextResponse } from 'next/server';
import { ManuscriptCreateSchema, ManuscriptPublicSchema } from '@/lib/contracts/manuscript';
import { prisma } from '@/lib/db';
import { requireAuth, type SessionUser } from '@/lib/require-auth';

export const dynamic = 'force-dynamic';

// GET /api/manuscripts — list author's manuscripts (scoped by authorId)
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

    const manuscripts = await prisma.manuscript.findMany({
      where: { authorId: author.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        subtitle: true,
        genre: true,
        subgenre: true,
        blurb: true,
        keywords: true,
        ageCategory: true,
        contentWarnings: true,
        wordCount: true,
        score: true,
        overallFeedback: true,
        scoredAt: true,
        status: true,
        rightsConfirmedAt: true,
        createdAt: true,
        publishedAt: true,
        publishedUrl: true,
      },
    });

    const validated = manuscripts.map((m) => ManuscriptPublicSchema.parse(m));
    return NextResponse.json({ data: validated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/manuscripts — create new submission
export async function POST(req: Request) {
  let user: SessionUser;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  try {
    const body = await req.json().catch(() => null);
    const parsed = ManuscriptCreateSchema.safeParse(body);

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

    const data = parsed.data;

    const manuscript = await prisma.manuscript.create({
      data: {
        authorId: author.id,
        filePath: data.filePath,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        coverImagePath: data.coverImagePath,
        title: data.title,
        genre: data.genre,
        subgenre: data.subgenre,
        blurb: data.blurb,
        keywords: data.keywords,
        ageCategory: data.ageCategory,
        contentWarnings: data.contentWarnings ?? [],
        wordCount: data.wordCount,
        rightsConfirmedAt: new Date(data.rightsConfirmedAt),
        rightsConfirmedIp: data.rightsConfirmedIp,
        status: 'SUBMITTED',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        authorId: author.id,
        manuscriptId: manuscript.id,
        action: 'SUBMISSION_CREATED',
        resource: 'Manuscript',
        resourceId: manuscript.id,
        metadata: { title: data.title, genre: data.genre },
        ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
      },
    });

    return NextResponse.json(ManuscriptPublicSchema.parse(manuscript), { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
