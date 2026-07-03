// @polsia:user-owned — post-submission success page. Verifies payment and shows confirmation.
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api-client';
import type { ManuscriptPublic } from '@/lib/contracts/manuscript';

function SuccessContent() {
  const _router = useRouter();
  const searchParams = useSearchParams();
  const manuscriptId = searchParams.get('manuscript_id');
  const sessionId = searchParams.get('session_id');

  const [manuscript, setManuscript] = useState<ManuscriptPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    if (!manuscriptId) {
      setLoading(false);
      return;
    }

    // Verify Stripe payment if session_id present
    if (sessionId) {
      fetch(`/api/stripe-billing/verify?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.verified) setPaymentVerified(true);
        })
        .catch(() => {});
    }

    // Fetch manuscript status
    apiFetch<ManuscriptPublic>(`/api/manuscripts/${manuscriptId}`)
      .then(setManuscript)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [manuscriptId, sessionId]);

  if (loading) {
    return <p className="text-center text-muted-foreground py-12">Loading…</p>;
  }

  if (!manuscriptId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No manuscript ID found.</p>
        <Button asChild>
          <a href="/submit">Submit a manuscript</a>
        </Button>
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    SUBMITTED: 'Submitted — Awaiting Review',
    SCORING: 'Being Scored',
    REVIEW: 'Under Review',
    AWAITING_PAYMENT: 'Awaiting Payment',
    PAYMENT_FAILED: 'Payment Failed',
    APPROVED: 'Approved',
    REJECTED: 'Not Approved',
    PUBLISHING: 'Publishing in Progress',
    PUBLISHED: 'Published',
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            role="img"
            aria-label="Submission successful"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-display text-h1 font-bold tracking-tight text-foreground">
          Submission Received
        </h1>
        <p className="mt-3 text-body-lg text-muted-foreground">
          Your manuscript has been submitted and is being processed.
        </p>
      </div>

      {manuscript && (
        <Card className="border-border bg-card text-left mb-8">
          <CardHeader>
            <CardTitle className="text-h4">{manuscript.title}</CardTitle>
            <CardDescription>
              Status: {statusLabels[manuscript.status] ?? manuscript.status}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-small">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Genre:</span>
              <span className="font-medium">{manuscript.genre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Word count:</span>
              <span className="font-medium">{manuscript.wordCount.toLocaleString()}</span>
            </div>
            {manuscript.score != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Score:</span>
                <span className="font-medium">{manuscript.score.toFixed(1)} / 10</span>
              </div>
            )}
            {paymentVerified && (
              <div className="mt-2 flex items-center gap-2 text-green-600">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Payment verified"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-small font-medium">Payment confirmed</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row justify-center">
        <Button asChild variant="outline">
          <a href="/dashboard">View Dashboard</a>
        </Button>
        <Button asChild>
          <a href="/submit">Submit Another</a>
        </Button>
      </div>

      {manuscript?.score && manuscript.score >= 8.5 && manuscript.status === 'AWAITING_PAYMENT' && (
        <div className="mt-8 p-4 rounded-lg border border-brand-200 bg-brand-50 text-center">
          <p className="text-small font-medium text-brand-700 mb-2">
            Your manuscript passed scoring!
          </p>
          <p className="text-small text-brand-600 mb-3">
            Complete your payment to move to the publishing queue.
          </p>
          <Button
            size="sm"
            onClick={() => {
              fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ manuscriptId }),
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.checkoutUrl) window.location.href = data.checkoutUrl;
                })
                .catch(() => {});
            }}
          >
            Pay Publishing Fee
          </Button>
        </div>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="min-h-dvh px-gutter py-section bg-[var(--background)]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-20%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[var(--brand-100)] opacity-30 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[var(--brand-200)] opacity-20 blur-3xl" />
      </div>
      <div className="relative max-w-2xl mx-auto pt-8">
        <Suspense fallback={<p className="text-center text-muted-foreground py-12">Loading…</p>}>
          <SuccessContent />
        </Suspense>
      </div>
    </main>
  );
}
