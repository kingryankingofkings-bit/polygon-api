'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { apiFetch } from '@/lib/api-client';
import type { PayoutSettings, PayoutSettingsUpdate } from '@/lib/contracts/royalty';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [payoutMethod, setPayoutMethod] = useState<'paypal' | 'stripe' | ''>('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [stripeAccountId, setStripeAccountId] = useState('');
  const [payoutHint, setPayoutHint] = useState<{ type: string; value: string } | null>(null);
  const [legalName, setLegalName] = useState('');

  useEffect(() => {
    apiFetch<PayoutSettings>('/api/settings/payout')
      .then((data) => {
        setPayoutMethod(data.method ?? '');
        setPayoutHint(data.hint ?? null);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!payoutMethod) return;
    if (payoutMethod === 'paypal' && !paypalEmail) return;
    if (payoutMethod === 'stripe' && !stripeAccountId) return;

    setSaving(true);
    setMessage(null);

    try {
      const body: PayoutSettingsUpdate = {
        method: payoutMethod,
        ...(payoutMethod === 'paypal' ? { paypalEmail } : { stripeAccountId }),
      };

      const res = await fetch('/api/settings/payout', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to save');

      setMessage({ type: 'success', text: 'Payout preferences saved securely.' });
      setPaypalEmail('');
      setStripeAccountId('');
    } catch {
      setMessage({ type: 'error', text: 'Failed to save. Try again.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-center text-muted-foreground py-12">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-body mt-1">
          Manage your account and payout preferences.
        </p>
      </div>

      {payoutHint && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-h4">Current Payout Method</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-small text-muted-foreground">
              {payoutHint.type === 'email'
                ? `PayPal: ${payoutHint.value}`
                : `Stripe: ${payoutHint.value}`}
            </p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSave}>
        <Card className="border-border bg-card mb-6">
          <CardHeader>
            <CardTitle className="text-h4">Payout Preferences</CardTitle>
            <CardDescription>
              Choose how you receive your royalties. Data is encrypted at rest.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Payout Method</Label>
              <RadioGroup
                value={payoutMethod}
                onValueChange={(v) => setPayoutMethod(v as 'paypal' | 'stripe')}
                className="space-y-3"
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="paypal" id="paypal" className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="paypal" className="font-medium cursor-pointer">
                      PayPal
                    </Label>
                    <p className="text-small text-muted-foreground">
                      Receive payouts to your PayPal account.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="stripe" id="stripe" className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="stripe" className="font-medium cursor-pointer">
                      Stripe
                    </Label>
                    <p className="text-small text-muted-foreground">
                      Receive payouts via Stripe (for larger publishers).
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {payoutMethod === 'paypal' && (
              <div className="grid gap-2">
                <Label htmlFor="paypal-email">PayPal Email</Label>
                <Input
                  id="paypal-email"
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="your@paypal.com"
                />
              </div>
            )}

            {payoutMethod === 'stripe' && (
              <div className="grid gap-2">
                <Label htmlFor="stripe-account">Stripe Account ID</Label>
                <Input
                  id="stripe-account"
                  value={stripeAccountId}
                  onChange={(e) => setStripeAccountId(e.target.value)}
                  placeholder="acct_..."
                />
              </div>
            )}

            {message && (
              <p
                className={`text-small ${message.type === 'success' ? 'text-green-600' : 'text-destructive'}`}
              >
                {message.text}
              </p>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={
                  saving ||
                  !payoutMethod ||
                  (payoutMethod === 'paypal' && !paypalEmail) ||
                  (payoutMethod === 'stripe' && !stripeAccountId)
                }
              >
                {saving ? 'Saving…' : 'Save Payout Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-h4">Legal Information</CardTitle>
          <CardDescription>This information is used for contract and tax purposes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="legal-name">Legal Name</Label>
            <Input
              id="legal-name"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="As it appears on legal documents"
            />
          </div>
          <p className="text-small text-muted-foreground">
            Your legal name is encrypted and stored securely. It is never displayed publicly.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-h4">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-foreground">Email Address</p>
              <p className="text-small text-muted-foreground">
                Used for sign-in and important notifications.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/profile">Edit Profile</a>
            </Button>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-foreground">Password</p>
              <p className="text-small text-muted-foreground">Change your account password.</p>
            </div>
            <Button variant="outline" size="sm">
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
