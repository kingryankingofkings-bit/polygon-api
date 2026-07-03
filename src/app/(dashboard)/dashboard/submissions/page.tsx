// @polsia:user-owned — manuscript submissions list.
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api-client';
import type { ManuscriptPublic } from '@/lib/contracts/manuscript';

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-700 border-blue-200',
  SCORING: 'bg-amber-100 text-amber-700 border-amber-200',
  REVIEW: 'bg-purple-100 text-purple-700 border-purple-200',
  AWAITING_PAYMENT: 'bg-orange-100 text-orange-700 border-orange-200',
  PAYMENT_FAILED: 'bg-red-100 text-red-700 border-red-200',
  APPROVED: 'bg-green-100 text-green-700 border-green-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
  PUBLISHING: 'bg-teal-100 text-teal-700 border-teal-200',
  PUBLISHED: 'bg-green-100 text-green-700 border-green-200',
};

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Submitted',
  SCORING: 'Scoring',
  REVIEW: 'Under Review',
  AWAITING_PAYMENT: 'Awaiting Payment',
  PAYMENT_FAILED: 'Payment Failed',
  APPROVED: 'Approved',
  REJECTED: 'Not Approved',
  PUBLISHING: 'Publishing',
  PUBLISHED: 'Published',
};

export default function SubmissionsPage() {
  const [manuscripts, setManuscripts] = useState<ManuscriptPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: ManuscriptPublic[] }>('/api/manuscripts')
      .then((res) => setManuscripts(res.data))
      .catch(() => setError('Failed to load manuscripts'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-center text-muted-foreground py-12">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-bold text-foreground">My Submissions</h1>
          <p className="text-muted-foreground text-body mt-1">
            Track the status of your manuscripts.
          </p>
        </div>
        <Button asChild>
          <Link href="/submit">New Submission</Link>
        </Button>
      </div>

      {error && <p className="text-destructive text-small">{error}</p>}

      {manuscripts.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No submissions yet.</p>
            <Button asChild variant="outline">
              <Link href="/submit">Submit Your First Manuscript</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {manuscripts.map((m) => (
            <Link key={m.id} href={`/dashboard/submissions/${m.id}`} className="block">
              <Card className="border-border bg-card hover:border-brand-300 hover:shadow-md transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-h4 truncate">{m.title}</CardTitle>
                      {m.subtitle && (
                        <p className="text-small text-muted-foreground mt-0.5 truncate">
                          {m.subtitle}
                        </p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 text-small px-2 py-1 rounded-full border font-medium ${STATUS_COLORS[m.status] ?? 'bg-muted'}`}
                    >
                      {STATUS_LABELS[m.status] ?? m.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-2 text-small">
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground">
                    <span>
                      Genre: <span className="font-medium text-foreground">{m.genre}</span>
                    </span>
                    <span>
                      Words:{' '}
                      <span className="font-medium text-foreground">
                        {m.wordCount.toLocaleString()}
                      </span>
                    </span>
                    {m.score != null && (
                      <span>
                        Score:{' '}
                        <span className="font-medium text-foreground">{m.score.toFixed(1)}</span>
                      </span>
                    )}
                    <span>
                      Submitted:{' '}
                      <span className="font-medium text-foreground">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </span>
                  </div>
                  {m.blurb && <p className="text-muted-foreground truncate mt-1">{m.blurb}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
