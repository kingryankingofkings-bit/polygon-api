'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { apiFetch } from '@/lib/api-client';
import {
  type BookSales,
  BookSalesSchema,
  type CurrentStatus,
  CurrentStatusSchema,
  type RoyaltySummary,
  RoyaltySummarySchema,
  type StatementList,
  StatementListSchema,
} from '@/lib/contracts/royalty';

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

function statusLabel(status: string) {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'CALCULATED':
      return 'Calculated';
    case 'APPROVED':
      return 'Approved';
    case 'PAID':
      return 'Paid';
    case 'HELD':
      return 'Held';
    default:
      return status;
  }
}

function statusVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'PENDING':
      return 'secondary';
    case 'CALCULATED':
      return 'outline';
    case 'APPROVED':
      return 'default';
    case 'PAID':
      return 'default';
    case 'HELD':
      return 'destructive';
    default:
      return 'secondary';
  }
}

function StatementDetailModal({
  statementId,
  onClose,
}: {
  statementId: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/royalties/statements/${statementId}`)
      .then(setDetail)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statementId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex justify-between items-center">
          <h2 className="text-h4 font-bold">Statement Detail</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading…</p>
          ) : detail ? (
            <pre className="text-sm text-foreground whitespace-pre-wrap">
              {JSON.stringify(detail, null, 2)}
            </pre>
          ) : (
            <p className="text-destructive">Failed to load statement.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function RoyaltiesClient() {
  const [summary, setSummary] = useState<RoyaltySummary | null>(null);
  const [books, setBooks] = useState<BookSales[]>([]);
  const [statements, setStatements] = useState<StatementList[]>([]);
  const [currentStatus, setCurrentStatus] = useState<CurrentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatementId, setSelectedStatementId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<RoyaltySummary>('/api/royalties/summary', { schema: RoyaltySummarySchema }),
      apiFetch<BookSales[]>('/api/royalties/books', { schema: BookSalesSchema.array() }),
      apiFetch<StatementList[]>('/api/royalties/statements', {
        schema: StatementListSchema.array(),
      }),
      apiFetch<CurrentStatus>('/api/royalties/current-status', { schema: CurrentStatusSchema }),
    ])
      .then(([s, b, st, cs]) => {
        setSummary(s as RoyaltySummary);
        setBooks(b as BookSales[]);
        setStatements(st as StatementList[]);
        setCurrentStatus(cs as CurrentStatus);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-center text-muted-foreground py-12">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 font-bold text-foreground">Royalties</h1>
        <p className="text-muted-foreground text-body mt-1">
          Track your earnings and payout history.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardDescription>Total Earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-display text-h2 font-bold text-foreground">
              ${(summary?.totalEarnings ?? 0).toFixed(2)}
            </p>
            <p className="text-small text-muted-foreground mt-1">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardDescription>Pending Payout</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-display text-h2 font-bold text-foreground">
              ${(summary?.pendingPayout ?? 0).toFixed(2)}
            </p>
            <p className="text-small text-muted-foreground mt-1">Next payout</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardDescription>Published Titles</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-display text-h2 font-bold text-foreground">
              {summary?.publishedTitles ?? 0}
            </p>
            <p className="text-small text-muted-foreground mt-1">Active books</p>
          </CardContent>
        </Card>
      </div>

      {currentStatus && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-h4">
              {MONTH_NAMES[currentStatus.currentMonth - 1]} {currentStatus.currentYear} Status
            </CardTitle>
            <CardDescription>Current month breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-h4 font-bold text-foreground">
                  {currentStatus.breakdown.pending.toFixed(2)}
                </p>
                <p className="text-small text-muted-foreground">Pending</p>
              </div>
              <div>
                <p className="text-h4 font-bold text-foreground">
                  {currentStatus.breakdown.calculated.toFixed(2)}
                </p>
                <p className="text-small text-muted-foreground">Calculated</p>
              </div>
              <div>
                <p className="text-h4 font-bold text-foreground">
                  {currentStatus.breakdown.approved.toFixed(2)}
                </p>
                <p className="text-small text-muted-foreground">Approved</p>
              </div>
              <div>
                <p className="text-h4 font-bold text-foreground">
                  {currentStatus.breakdown.paid.toFixed(2)}
                </p>
                <p className="text-small text-muted-foreground">Paid</p>
              </div>
              <div>
                <p className="text-h4 font-bold text-foreground">
                  {currentStatus.breakdown.held.toFixed(2)}
                </p>
                <p className="text-small text-muted-foreground">Held</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {books.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-2">No published titles yet.</p>
            <p className="text-small text-muted-foreground">
              Submit and publish your first manuscript to start earning royalties.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-h4">Published Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-small">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Title</th>
                    <th className="pb-3 font-medium text-right">Gross</th>
                    <th className="pb-3 font-medium text-right">Fees</th>
                    <th className="pb-3 font-medium text-right">Refunds</th>
                    <th className="pb-3 font-medium text-right">Chargebacks</th>
                    <th className="pb-3 font-medium text-right">Net</th>
                    <th className="pb-3 font-medium text-right">Royalty (75%)</th>
                    <th className="pb-3 font-medium text-right">This Month</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.bookId} className="border-b border-border last:border-0">
                      <td className="py-3">
                        <p className="font-medium text-foreground">{book.title}</p>
                        <p className="text-muted-foreground">{book.genre}</p>
                      </td>
                      <td className="py-3 text-right text-foreground">${book.gross.toFixed(2)}</td>
                      <td className="py-3 text-right text-muted-foreground">
                        ${(book.processorFee + book.platformFee).toFixed(2)}
                      </td>
                      <td className="py-3 text-right text-muted-foreground">
                        ${book.refunds.toFixed(2)}
                      </td>
                      <td className="py-3 text-right text-muted-foreground">
                        ${book.chargebacks.toFixed(2)}
                      </td>
                      <td className="py-3 text-right text-foreground font-medium">
                        ${book.net.toFixed(2)}
                      </td>
                      <td className="py-3 text-right text-foreground font-medium">
                        ${book.royalty.toFixed(2)}
                      </td>
                      <td className="py-3 text-right text-foreground">
                        ${book.thisMonthPayout.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {statements.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-h4">Monthly Statements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statements.map((stmt) => (
                <button
                  type="button"
                  key={stmt.id}
                  onClick={() => setSelectedStatementId(stmt.id)}
                  className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {MONTH_NAMES[stmt.periodMonth - 1]} {stmt.periodYear}
                    </p>
                    <p className="text-small text-muted-foreground">
                      Royalty: ${stmt.totalRoyalty.toFixed(2)}
                    </p>
                  </div>
                  <Badge variant={statusVariant(stmt.status)}>{statusLabel(stmt.status)}</Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-h4">Payout Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-small text-muted-foreground leading-relaxed">
            Payout details are managed securely. To update your payout preferences, visit{' '}
            <a href="/dashboard/settings" className="text-primary hover:underline">
              Settings
            </a>
            .
          </p>
          <Separator />
          <div className="space-y-3">
            <div className="flex justify-between text-small">
              <span className="text-muted-foreground">Payout schedule:</span>
              <span className="font-medium">Monthly (60-day hold)</span>
            </div>
            <div className="flex justify-between text-small">
              <span className="text-muted-foreground">Minimum payout:</span>
              <span className="font-medium">$25.00</span>
            </div>
            <div className="flex justify-between text-small">
              <span className="text-muted-foreground">Royalty rate:</span>
              <span className="font-medium">75% of net sales</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedStatementId && (
        <StatementDetailModal
          statementId={selectedStatementId}
          onClose={() => setSelectedStatementId(null)}
        />
      )}
    </div>
  );
}
