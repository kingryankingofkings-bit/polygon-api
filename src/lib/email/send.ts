// @polsia:framework-owned - DO NOT EDIT. Code installed by polsia/modules/email@0.2.0. Drift = commit rejected.
// Server-only sendEmail helper — POSTs to the Polsia email proxy. Import it from your app's
// OWN server route handlers (never expose a generic /api/email route).

import 'server-only';
import { env } from '@/lib/env';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  id: string;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const url = `${env.POLSIA_EMAIL_PROXY_URL.replace(/\/+$/, '').replace(/\/send$/, '')}/send`;
  const body =
    input.text ??
    input.html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  // POLSIA_API_KEY via process.env (platform-injected; not in typed env — ai/stripe declare it).
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.POLSIA_API_KEY ?? ''}`,
    },
    body: JSON.stringify({
      to: input.to,
      subject: input.subject,
      body,
      html: input.html,
      ...(input.text ? { text: input.text } : {}),
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`email proxy send failed: ${res.status} ${detail}`.trim());
  }
  return (await res.json()) as SendEmailResult;
}
