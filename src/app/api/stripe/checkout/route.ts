// @polsia:user-owned — Create Stripe checkout session for publishing fee.
// Fee: <=99,999 words = $140; >=100,000 words = $300.
// Requires manuscriptId + score >= 8.5.
// Payment link is created via the Stripe MCP in the workflow; this route
// returns the pre-configured checkout URL for the given manuscript.
import 'server-only';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, type SessionUser } from '@/lib/require-auth';

export const dynamic = 'force-dynamic';

// Pre-created payment links (one per fee tier)
// These are created via the Stripe MCP and stored as environment variables
const PAYMENT_LINKS: Record<string, string | undefined> = {
  standard: process.env.STRIPE_PAYMENT_LINK_STANDARD,
  large: process.env.STRIPE_PAYMENT_LINK_LARGE,
};

export async function POST(req: Request) {
  let user: SessionUser;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  try {
    const body = await req.json().catch(() => null);
    const manuscriptId = body?.manuscriptId as string | undefined;

    if (!manuscriptId) {
      return NextResponse.json({ error: 'manuscriptId is required' }, { status: 400 });
    }

    const author = await prisma.author.findUnique({
      where: { userId: user.id },
    });

    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    const manuscript = await prisma.manuscript.findFirst({
      where: { id: manuscriptId, authorId: author.id },
    });

    if (!manuscript) {
      return NextResponse.json({ error: 'Manuscript not found' }, { status: 404 });
    }

    if (!manuscript.score || manuscript.score < 8.5) {
      return NextResponse.json(
        { error: 'Score must be at least 8.5 to proceed to payment' },
        { status: 422 },
      );
    }

    // Determine fee tier
    const isLarge = manuscript.wordCount >= 100000;
    const paymentLinkUrl = isLarge ? PAYMENT_LINKS.large : PAYMENT_LINKS.standard;

    if (!paymentLinkUrl) {
      return NextResponse.json(
        { error: 'Payment not configured. Contact support.' },
        { status: 503 },
      );
    }

    // Append manuscript_id for verification on success page
    const checkoutUrl = `${paymentLinkUrl}${paymentLinkUrl.includes('?') ? '&' : '?'}manuscript_id=${manuscriptId}`;

    // Update manuscript status to AWAITING_PAYMENT
    await prisma.manuscript.update({
      where: { id: manuscriptId },
      data: { status: 'AWAITING_PAYMENT' },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        authorId: author.id,
        manuscriptId,
        action: 'PAYMENT_PROMPTED',
        resource: 'Manuscript',
        resourceId: manuscriptId,
        metadata: {
          feeTier: isLarge ? 'large' : 'standard',
          wordCount: manuscript.wordCount,
          score: manuscript.score,
        },
        ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
      },
    });

    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
