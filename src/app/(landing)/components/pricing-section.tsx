import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function PricingSection() {
  return (
    <section id="pricing" className="section bg-slate-950">
      <div className="container-page">
        <div className="mb-12 text-center">
          <p className="text-eyebrow mb-3 text-yellow-500/70">Publishing Fees</p>
          <h2 className="font-display text-h2 font-bold tracking-tight text-slate-100">
            Transparent, One-Time Pricing
          </h2>
          <p className="mt-3 text-body-lg text-slate-400">
            No hidden fees. No monthly subscriptions. Just professional publishing.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
          {/* Standard */}
          <Card className="border-slate-700/60 bg-slate-900 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-h3 font-bold text-slate-100">
                Standard Publishing
              </CardTitle>
              <CardDescription className="text-body text-slate-400">
                For manuscripts up to 99,999 words.
              </CardDescription>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-5xl font-bold text-yellow-500">$140</span>
                <span className="text-body text-slate-400">one-time</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2">
                {[
                  'AI Manuscript Scoring (6 dimensions)',
                  'Professional interior formatting',
                  'Ebook & print-ready formats',
                  'Cover design consultation',
                  'ISBN registration (optional)',
                  'Distribution to major bookstores',
                  'Monthly royalty payments (75% net)',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-small text-slate-300">
                    <span className="mt-0.5 text-yellow-500">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Separator className="my-4 bg-slate-700/50" />
              <Button asChild className="w-full bg-yellow-500 text-slate-950 hover:bg-yellow-400">
                <a href="/submit">Get Started</a>
              </Button>
            </CardContent>
          </Card>

          {/* Extended */}
          <Card className="border-yellow-500/20 bg-slate-900 shadow-xl ring-1 ring-yellow-500/10">
            <CardHeader className="pb-4">
              <div className="mb-2">
                <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
                  Extended Format
                </Badge>
              </div>
              <CardTitle className="text-h3 font-bold text-slate-100">
                Extended Publishing
              </CardTitle>
              <CardDescription className="text-body text-slate-400">
                For manuscripts ≥ 100,000 words.
              </CardDescription>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-5xl font-bold text-yellow-500">$300</span>
                <span className="text-body text-slate-400">one-time</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2">
                {[
                  'Everything in Standard, plus:',
                  'Extended format support (100k+ words)',
                  'High-page-count print layout',
                  'Priority processing',
                  'Dedicated formatting review',
                  'ISBN registration (optional)',
                  'Monthly royalty payments (75% net)',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-small text-slate-300">
                    <span className="mt-0.5 text-yellow-500">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Separator className="my-4 bg-slate-700/50" />
              <Button asChild className="w-full bg-yellow-500 text-slate-950 hover:bg-yellow-400">
                <a href="/submit">Get Started</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Royalty note */}
        <div className="mx-auto mt-8 max-w-2xl text-center">
          <p className="text-small text-slate-500">
            <strong className="text-slate-400">Authors keep 75% of net royalties.</strong> Monthly
            royalty payments with transparent statements showing gross sales, platform fees, and net
            payout.
          </p>
          <p className="mt-2 text-caption text-slate-600">
            Optional ISBN and copyright registration — fees verified at time of order.
          </p>
        </div>
      </div>
    </section>
  );
}
