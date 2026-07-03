// @app:framework-owned - DO NOT EDIT. Code installed by app/modules/stripe-billing@0.1.0. Drift = commit rejected.
//
// Server-only helpers for App-managed Stripe billing.
// Agents create checkout/payment/subscription links through the Stripe MCP.
// Customer app code verifies completed sessions through App's API using the
// platform-injected company proxy key. No Stripe SDK or Stripe provider secrets
// are present in the customer repo.

import 'server-only';
import { env } from '@/lib/env';
import {
  type CheckoutVerificationResult,
  checkoutVerificationResultSchema,
  type SubscriptionStatusResult,
  subscriptionStatusResultSchema,
} from '@/lib/stripe-billing/schema';

export class StripeBillingConfigurationError extends Error {
  constructor(message = 'Stripe billing is not configured for this app.') {
    super(message);
    this.name = 'StripeBillingConfigurationError';
  }
}

export interface VerifyCheckoutSessionInput {
  sessionId: string;
}

export interface GetSubscriptionStatusInput {
  email: string;
}

function appApiBaseUrl() {
  return env.APP_API_BASE_URL.replace(/\/+$/, '');
}

function appApiKey() {
  const key = env.APP_API_KEY ?? env.APP_API_TOKEN;
  if (!key) {
    throw new StripeBillingConfigurationError(
      'APP_API_KEY is missing. App injects it into deployed apps; local dev must set it manually.',
    );
  }
  return key;
}

async function getAppJson(path: string, searchParams: Record<string, string>) {
  const base = appApiBaseUrl();
  const url = new URL(`${base}${path.startsWith('/') ? path : `/${path}`}`);
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${appApiKey()}`,
      accept: 'application/json',
    },
    cache: 'no-store',
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = body && typeof body === 'object' && 'error' in body ? String(body.error) : '';
    throw new Error(`App billing API request failed: ${res.status} ${detail}`.trim());
  }
  return body;
}

export async function verifyCheckoutSession(
  input: VerifyCheckoutSessionInput,
): Promise<CheckoutVerificationResult> {
  const body = await getAppJson('/api/company-payments/verify', {
    session_id: input.sessionId,
  });
  return checkoutVerificationResultSchema.parse(body);
}

export async function getSubscriptionStatus(
  input: GetSubscriptionStatusInput,
): Promise<SubscriptionStatusResult> {
  const body = await getAppJson('/api/company-payments/subscription-status', {
    email: input.email,
  });
  return subscriptionStatusResultSchema.parse(body);
}
