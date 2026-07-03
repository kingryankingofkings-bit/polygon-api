// @app:user-owned — submission detail page with status timeline.
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { apiFetch } from '@/lib/api-client';
import type { ManuscriptPublic } from '@/lib/contracts/manuscript';

const STATUS_FLOW = [
  'SUBMITTED',
  'SCORING',
  'REVIEW',
  'APPROVED',
  'REJECTED',
  'AWAITING_PAYMENT',
  'PAYMENT_FAILED',
  'PUBLISHING',
  'PUBLISHED',
];

const STATUS_DESCRIPTIONS: Record<string, string> = {
  SUBMITTED: 'Manuscript received and queued for analysis.',
  SCORING: 'AI is evaluating your manuscript on five dimensions.',
  REVIEW: 'Your manuscript is being reviewed by our team.',
  APPROVED: 'Your manuscript has been approved for publishing.',
  REJECTED: 'Unfortunately, this manuscript does not meet our standards. You may submit again.',
  AWAITING_PAYMENT: 'Your manuscript passed! Complete payment to proceed.',
  PAYMENT_FAILED: 'Payment was unsuccessful. Please try again.',
  PUBLISHING: 'Your manuscript is being formatted and prepared for distribution.',
  PUBLISHED: 'Your book is live!',
};

export default function SubmissionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [manuscript, setManuscript] = useState<ManuscriptPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiFetch<ManuscriptPublic>(`/api/manuscripts/${id}`)
      .then(setManuscript)
      .catch(() => setError('Failed to load manuscript'))
      .finally(() => setLoading(false));
  }, [id]);

  function handlePay() {
    if (!manuscript) return;
    setPaying(true);
    fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ manuscriptId: manuscript.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.checkoutUrl) window.location.href = data.checkoutUrl;
        else setError('Failed to create payment link');
      })
      .catch(() => setError('Payment error'))
      .finally(() => setPaying(false));
  }

  if (loading) return <p className="text-center text-muted-foreground py-12">Loading…</p>;
  if (error || !manuscript)
    return <p className="text-destructive text-center py-12">{error ?? 'Not found'}</p>;

  const currentIdx = STATUS_FLOW.indexOf(manuscript.status);
  const _isPassed = manuscript.status !== 'REJECTED' && manuscript.status !== 'PAYMENT_FAILED';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" asChild className="shrink-0">
          <a href="/dashboard/submissions">← Back</a>
        </Button>
        <div className="min-w-0">
          <h1 className="text-h2 font-bold text-foreground truncate">{manuscript.title}</h1>
          {manuscript.subtitle && (
            <p className="text-muted-foreground text-body">{manuscript.subtitle}</p>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-h4">Status</CardTitle>
          <CardDescription>
            {STATUS_DESCRIPTIONS[manuscript.status] ?? manuscript.status}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-1">
            {STATUS_FLOW.slice(0, 6).map((status, i) => {
              const done =
                i < currentIdx ||
                (status === 'AWAITING_PAYMENT' && manuscript.status === 'PUBLISHED');
              const active = status === manuscript.status;
              const failed = status === 'REJECTED' && manuscript.status === 'REJECTED';
              return (
                <div key={status} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      done
                        ? 'bg-brand-600 text-white'
                        : active
                          ? 'bg-brand-100 border-2 border-brand-600 text-brand-700'
                          : failed
                            ? 'bg-red-100 text-red-700'
                            : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {done ? '✓' : i + 1}
                  </div>
                  <span
                    className={`text-caption text-center hidden sm:block ${active ? 'font-medium' : 'text-muted-foreground'}`}
                  >
                    {status.replace('_', ' ')}
                  </span>
                  {i < 5 && (
                    <div className={`w-full h-0.5 mt-1 ${done ? 'bg-brand-300' : 'bg-border'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {manuscript.status === 'AWAITING_PAYMENT' && (
            <div className="mt-4 p-4 rounded-lg border border-brand-200 bg-brand-50">
              <p className="text-small font-medium text-brand-700 mb-1">
                Your manuscript passed scoring!
              </p>
              <p className="text-small text-brand-600 mb-3">
                Pay the publishing fee to move to the formatting queue.
              </p>
              <Button size="sm" onClick={handlePay} disabled={paying}>
                {paying ? 'Loading…' : 'Pay Publishing Fee'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Score Results */}
      {manuscript.score != null && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-h4">AI Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div
                  className={`font-display text-5xl font-bold ${manuscript.score >= 8.5 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {manuscript.score.toFixed(1)}
                </div>
                <p className="text-small text-muted-foreground mt-1">/ 10.0</p>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-small mb-1">
                  <span className="text-muted-foreground">Pass threshold: 8.5</span>
                  <span
                    className={
                      manuscript.score >= 8.5
                        ? 'text-green-600 font-medium'
                        : 'text-red-600 font-medium'
                    }
                  >
                    {manuscript.score >= 8.5 ? 'PASSED' : 'NOT PASSED'}
                  </span>
                </div>
                <Progress value={manuscript.score * 10} className="h-3" />
              </div>
            </div>
            {manuscript.overallFeedback && (
              <div className="mt-4">
                <p className="text-small font-medium text-foreground mb-1">AI Feedback</p>
                <p className="text-small text-muted-foreground leading-relaxed">
                  {manuscript.overallFeedback}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Manuscript Details */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-h4">Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-small">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-muted-foreground">Genre:</span>{' '}
              <span className="font-medium">{manuscript.genre}</span>
            </div>
            {manuscript.subgenre && (
              <div>
                <span className="text-muted-foreground">Subgenre:</span>{' '}
                <span className="font-medium">{manuscript.subgenre}</span>
              </div>
            )}
            {manuscript.ageCategory && (
              <div>
                <span className="text-muted-foreground">Age category:</span>{' '}
                <span className="font-medium">{manuscript.ageCategory}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Word count:</span>{' '}
              <span className="font-medium">{manuscript.wordCount.toLocaleString()}</span>
            </div>
          </div>
          {manuscript.keywords.length > 0 && (
            <div>
              <span className="text-muted-foreground">Keywords:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {manuscript.keywords.map((k) => (
                  <Badge key={k} variant="outline" className="text-caption">
                    {k}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {manuscript.blurb && (
            <div>
              <span className="text-muted-foreground">Description:</span>
              <p className="mt-1 text-foreground leading-relaxed">{manuscript.blurb}</p>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-muted-foreground">
            <span>Submitted:</span>
            <span className="font-medium text-foreground">
              {new Date(manuscript.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          {manuscript.publishedAt && (
            <div className="flex justify-between text-muted-foreground">
              <span>Published:</span>
              <span className="font-medium text-foreground">
                {new Date(manuscript.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
