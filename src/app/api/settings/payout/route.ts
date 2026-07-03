import 'server-only';
import { NextResponse } from 'next/server';
import { PayoutSettingsSchema, PayoutSettingsUpdateSchema } from '@/lib/contracts/royalty';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email/send';
import { requireAuth } from '@/lib/require-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await requireAuth(req);

  const author = await prisma.author.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      payoutPayPal: true,
      payoutStripe: true,
    },
  });

  if (!author) {
    return NextResponse.json({ error: 'Author not found' }, { status: 404 });
  }

  let hint: { type: 'email'; value: string } | { type: 'account'; value: string } | null = null;
  let method: 'paypal' | 'stripe' | null = null;

  if (author.payoutPayPal) {
    method = 'paypal';
    const email = author.payoutPayPal;
    const parts = email.split('@');
    const local = parts[0] ?? '';
    const domain = parts[1] ?? '';
    const masked = `${local.slice(0, 2)}***@${domain}`;
    hint = { type: 'email', value: masked };
  } else if (author.payoutStripe) {
    method = 'stripe';
    const acct = author.payoutStripe;
    const masked = `acct_••••${acct.slice(-4)}`;
    hint = { type: 'account', value: masked };
  }

  const result = PayoutSettingsSchema.parse({ method, hint });
  return NextResponse.json(result);
}

export async function PATCH(req: Request) {
  const user = await requireAuth(req);

  const body = await req.json();
  const parsed = PayoutSettingsUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { method, paypalEmail, stripeAccountId } = parsed.data;

  const author = await prisma.author.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!author) {
    return NextResponse.json({ error: 'Author not found' }, { status: 404 });
  }

  const userEmail = user.email;

  const updateData: { payoutPayPal?: string | null; payoutStripe?: string | null } = {};

  if (method === 'paypal' && paypalEmail) {
    updateData.payoutPayPal = paypalEmail;
    updateData.payoutStripe = null;
  } else if (method === 'stripe' && stripeAccountId) {
    updateData.payoutStripe = stripeAccountId;
    updateData.payoutPayPal = null;
  }

  await prisma.author.update({
    where: { id: author.id },
    data: updateData,
  });

  await sendEmail({
    to: userEmail,
    subject: 'Payout Preferences Updated',
    html: `
      <p>Your payout preferences have been updated successfully.</p>
      <p>Method: ${method === 'paypal' ? 'PayPal' : 'Stripe'}</p>
      <p>If you did not make this change, please contact support immediately.</p>
    `,
  });

  return NextResponse.json({ success: true });
}
