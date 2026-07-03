import 'server-only';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email/send';

async function adminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== 'admin') {
    return null;
  }
  return session;
}

export const dynamic = 'force-dynamic';

const MINIMUM_PAYOUT_CENTS = 2500; // $25.00

async function processPayPalPayout(
  email: string,
  amountCents: number,
  statementId: string,
  _authorId: string,
): Promise<{ transactionId: string } | { error: string }> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return { error: 'PayPal API credentials not configured' };
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  // Create payout
  const payoutResponse = await fetch('https://api.paypal.com/v1/payments/payouts', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender_batch_header: {
        sender_batch_id: `stmt_${statementId.slice(0, 12)}_${Date.now()}`,
        email_subject: 'You received a royalty payout from Author Bridge Publishing',
        email_message: 'Your royalty payout has been disbursed. Thank you for publishing with us.',
      },
      items: [
        {
          recipient_type: 'EMAIL',
          receiver: email,
          amount: {
            value: (amountCents / 100).toFixed(2),
            currency: 'USD',
          },
          note: `Royalty statement ${statementId.slice(0, 8)}`,
          sender_item_id: `item_${statementId.slice(0, 8)}`,
        },
      ],
    }),
  });

  if (!payoutResponse.ok) {
    const err = await payoutResponse.text();
    return { error: `PayPal API error: ${err}` };
  }

  const payout = await payoutResponse.json();
  return { transactionId: payout.batch_header.payout_batch_id };
}

async function processStripePayout(
  accountId: string,
  amountCents: number,
  statementId: string,
  authorId: string,
): Promise<{ transactionId: string } | { error: string }> {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return { error: 'Stripe API key not configured' };
  }

  const transferResponse = await fetch('https://api.stripe.com/v1/transfers', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      amount: amountCents.toString(),
      currency: 'usd',
      destination: accountId,
      metadata: JSON.stringify({ statementId, authorId }),
    }),
  });

  if (!transferResponse.ok) {
    const err = await transferResponse.text();
    return { error: `Stripe API error: ${err}` };
  }

  const transfer = await transferResponse.json();
  return { transactionId: transfer.id };
}

function maskEmail(email: string): string {
  const parts = email.split('@');
  const local = parts[0] ?? '';
  const domain = parts[1] ?? '';
  return `${local.slice(0, 2)}***@${domain}`;
}

function maskAccountId(acct: string): string {
  return `acct_••••${acct.slice(-4)}`;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export async function POST(_req: Request) {
  const session = await adminSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const adminId = session.user.id;

  const statements = await prisma.royaltyStatement.findMany({
    where: { status: 'APPROVED' },
  });

  if (statements.length === 0) {
    return NextResponse.json({ message: 'No approved statements to process.', processed: 0 });
  }

  const authorIds = [...new Set(statements.map((s) => s.authorId))];

  const authors = await prisma.author.findMany({
    where: { id: { in: authorIds } },
    select: {
      id: true,
      penName: true,
      userId: true,
      payoutPayPal: true,
      payoutStripe: true,
    },
  });

  const authorUserIds = authors.map((a) => a.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: authorUserIds } },
    select: { id: true, email: true },
  });
  const userEmailMap = new Map(users.map((u) => [u.id, u.email]));

  const authorMap = new Map(
    authors.map((a) => [a.id, { ...a, email: userEmailMap.get(a.userId) ?? '' }]),
  );

  let processed = 0;
  const errors: string[] = [];

  for (const statement of statements) {
    if (statement.totalRoyalty < MINIMUM_PAYOUT_CENTS) {
      // Skip below threshold — leave as APPROVED
      await prisma.payoutAuditLog.create({
        data: {
          adminId: adminId,
          action: 'SKIP_THRESHOLD',
          payoutId: null,
          metadata: {
            statementId: statement.id,
            authorId: statement.authorId,
            totalRoyalty: statement.totalRoyalty,
            threshold: MINIMUM_PAYOUT_CENTS,
            reason: 'below minimum payout threshold',
          },
        },
      });
      continue;
    }

    const author = authorMap.get(statement.authorId);
    if (!author) {
      errors.push(`No author found for statement ${statement.id}`);
      continue;
    }

    let result:
      | { method: 'PAYPAL'; transactionId: string }
      | { method: 'STRIPE'; transactionId: string }
      | { error: string };

    if (author.payoutPayPal) {
      const payoutResult = await processPayPalPayout(
        author.payoutPayPal,
        statement.totalRoyalty,
        statement.id,
        statement.authorId,
      );
      if ('error' in payoutResult) {
        errors.push(`Statement ${statement.id}: ${payoutResult.error}`);
        continue;
      }
      result = { method: 'PAYPAL', transactionId: payoutResult.transactionId };
    } else if (author.payoutStripe) {
      const payoutResult = await processStripePayout(
        author.payoutStripe,
        statement.totalRoyalty,
        statement.id,
        statement.authorId,
      );
      if ('error' in payoutResult) {
        errors.push(`Statement ${statement.id}: ${payoutResult.error}`);
        continue;
      }
      result = { method: 'STRIPE', transactionId: payoutResult.transactionId };
    } else {
      errors.push(`Statement ${statement.id}: No payout method on file`);
      continue;
    }

    // Create PayoutRecord
    const payoutRecord = await prisma.payoutRecord.create({
      data: {
        authorId: statement.authorId,
        statementId: statement.id,
        amount: statement.totalRoyalty,
        method: result.method,
        transactionId: result.transactionId,
        status: 'SENT',
        processedAt: new Date(),
        payoutEmailHint: author.payoutPayPal ? maskEmail(author.payoutPayPal) : null,
        payoutAccountHint: author.payoutStripe ? maskAccountId(author.payoutStripe) : null,
      },
    });

    // Update statement to PAID
    await prisma.royaltyStatement.update({
      where: { id: statement.id },
      data: { status: 'PAID' },
    });

    // Send email notification
    const monthName = MONTH_NAMES[statement.periodMonth - 1];
    await sendEmail({
      to: author.email,
      subject: `Your Royalty Payout — ${monthName} ${statement.periodYear}`,
      html: `
        <p>Your royalty payout has been disbursed.</p>
        <ul>
          <li><strong>Amount:</strong> $${(statement.totalRoyalty / 100).toFixed(2)}</li>
          <li><strong>Method:</strong> ${result.method === 'PAYPAL' ? 'PayPal' : 'Stripe'}</li>
          <li><strong>Transaction ID:</strong> ${result.transactionId}</li>
          <li><strong>Statement Period:</strong> ${monthName} ${statement.periodYear}</li>
        </ul>
        <p>Log in to your dashboard to view your statement details.</p>
      `,
    }).catch(() => {
      // Non-fatal — email failure shouldn't roll back the payout
    });

    // Audit log
    await prisma.payoutAuditLog.create({
      data: {
        adminId: adminId,
        action: 'PROCESS',
        payoutId: payoutRecord.id,
        metadata: {
          statementId: statement.id,
          authorId: statement.authorId,
          amount: statement.totalRoyalty,
          method: result.method,
          transactionId: result.transactionId,
        },
      },
    });

    processed++;
  }

  return NextResponse.json({
    processed,
    errors: errors.length > 0 ? errors : undefined,
  });
}
