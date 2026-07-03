'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiFetch } from '@/lib/api-client';

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

interface QueueItem {
  id: string;
  authorId: string;
  authorName: string;
  periodYear: number;
  periodMonth: number;
  totalRoyalty: number;
  status: string;
  payoutMethod: 'PAYPAL' | 'STRIPE' | null;
  payoutHint: { type: 'email'; value: string } | { type: 'account'; value: string } | null;
  payouts: {
    id: string;
    amount: number;
    method: string;
    transactionId: string | null;
    status: string;
    processedAt: string | null;
    payoutEmailHint: string | null;
    payoutAccountHint: string | null;
  }[];
}

interface AllStatementsItem {
  id: string;
  authorId: string;
  authorName: string;
  periodYear: number;
  periodMonth: number;
  totalGrossSales: number;
  totalProcessorFees: number;
  totalPlatformFees: number;
  totalRefunds: number;
  totalChargebacks: number;
  totalNetRevenue: number;
  totalRoyalty: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function AdminRoyaltiesClient() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [statements, setStatements] = useState<AllStatementsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'queue' | 'statements'>('queue');
  const [exportYear, setExportYear] = useState(new Date().getFullYear().toString());
  const [exportMonth, setExportMonth] = useState((new Date().getMonth() + 1).toString());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [queueRes, statementsRes] = await Promise.all([
        apiFetch<QueueItem[]>('/api/admin/royalties/queue'),
        apiFetch<AllStatementsItem[]>('/api/admin/royalties'),
      ]);
      setQueue(queueRes as QueueItem[]);
      setStatements(statementsRes as AllStatementsItem[]);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleHold(statementId: string) {
    try {
      await fetch(`/api/admin/royalties/${statementId}/hold`, { method: 'PATCH' });
      await loadData();
    } catch {
      // handle error
    }
  }

  async function handleApprove(statementId: string) {
    try {
      await fetch(`/api/admin/royalties/${statementId}/approve`, { method: 'PATCH' });
      await loadData();
    } catch {
      // handle error
    }
  }

  async function handleProcessPayouts() {
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/royalties/process', { method: 'POST' });
      const data = await res.json();
      alert(
        `Processed: ${data.processed}${data.errors ? `\nErrors: ${data.errors.join(', ')}` : ''}`,
      );
      await loadData();
    } catch (_err) {
      alert('Failed to process payouts');
    } finally {
      setProcessing(false);
    }
  }

  async function handleExport(e: React.FormEvent) {
    e.preventDefault();
    const url = `/api/admin/royalties/export?periodYear=${exportYear}&periodMonth=${exportMonth}`;
    window.open(url, '_blank');
  }

  if (loading) {
    return <p className="text-center text-muted-foreground py-12">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 font-bold text-foreground">Royalty Management</h1>
        <p className="text-muted-foreground text-body mt-1">
          Manage author royalty statements and payout processing.
        </p>
      </div>

      <div className="flex gap-4 border-b border-border pb-0">
        <button
          type="button"
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 text-small font-medium border-b-2 transition-colors ${
            activeTab === 'queue'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Payout Queue ({queue.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('statements')}
          className={`px-4 py-2 text-small font-medium border-b-2 transition-colors ${
            activeTab === 'statements'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          All Statements
        </button>
      </div>

      {activeTab === 'queue' && (
        <>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleProcessPayouts}
              disabled={processing || queue.filter((q) => q.status === 'APPROVED').length === 0}
            >
              {processing ? 'Processing…' : 'Process Approved Payouts'}
            </Button>
            <form onSubmit={handleExport} className="flex gap-2 items-center">
              <select
                value={exportYear}
                onChange={(e) => setExportYear(e.target.value)}
                className="border border-border bg-background text-foreground rounded px-2 py-1 text-small"
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <select
                value={exportMonth}
                onChange={(e) => setExportMonth(e.target.value)}
                className="border border-border bg-background text-foreground rounded px-2 py-1 text-small"
              >
                {MONTH_NAMES.map((m) => (
                  <option key={m} value={MONTH_NAMES.indexOf(m) + 1}>
                    {m}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="outline" size="sm">
                Export CSV
              </Button>
            </form>
          </div>

          {queue.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No statements in the payout queue.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {queue.map((item) => (
                <Card key={item.id} className="border-border bg-card">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{item.authorName}</p>
                        <p className="text-small text-muted-foreground">
                          {MONTH_NAMES[item.periodMonth - 1]} {item.periodYear}
                          {' — '}${item.totalRoyalty.toFixed(2)}
                          {' — '}
                          {item.payoutHint
                            ? item.payoutHint.type === 'email'
                              ? `PayPal ${item.payoutHint.value}`
                              : `Stripe ${item.payoutHint.value}`
                            : 'No payout method'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusVariant(item.status)}>
                          {statusLabel(item.status)}
                        </Badge>
                        {item.status !== 'PAID' && item.status !== 'HELD' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleHold(item.id)}>
                              Hold
                            </Button>
                            {item.status !== 'APPROVED' && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApprove(item.id)}
                              >
                                Approve
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'statements' && (
        <Card className="border-border bg-card">
          <CardContent className="overflow-x-auto">
            <table className="w-full text-small">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Author</th>
                  <th className="pb-3 font-medium">Period</th>
                  <th className="pb-3 font-medium text-right">Gross</th>
                  <th className="pb-3 font-medium text-right">Fees</th>
                  <th className="pb-3 font-medium text-right">Net</th>
                  <th className="pb-3 font-medium text-right">Royalty</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {statements.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="py-3 text-foreground">{s.authorName}</td>
                    <td className="py-3 text-muted-foreground">
                      {MONTH_NAMES[s.periodMonth - 1]} {s.periodYear}
                    </td>
                    <td className="py-3 text-right">${s.totalGrossSales.toFixed(2)}</td>
                    <td className="py-3 text-right text-muted-foreground">
                      ${(s.totalProcessorFees + s.totalPlatformFees).toFixed(2)}
                    </td>
                    <td className="py-3 text-right text-foreground">
                      ${s.totalNetRevenue.toFixed(2)}
                    </td>
                    <td className="py-3 text-right font-medium text-foreground">
                      ${s.totalRoyalty.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <Badge variant={statusVariant(s.status)}>{statusLabel(s.status)}</Badge>
                    </td>
                  </tr>
                ))}
                {statements.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No statements yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
