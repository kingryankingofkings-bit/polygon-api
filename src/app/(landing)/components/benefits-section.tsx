import { Card, CardContent } from '@/components/ui/card';

const benefits = [
  {
    title: 'Retain Full Rights',
    description: 'You keep 100% of your copyright. We never claim ownership of your work.',
    icon: (
      <svg
        role="img"
        aria-label="Shield icon"
        className="h-6 w-6 text-yellow-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
  },
  {
    title: 'Transparent Royalty Statements',
    description: 'Clear monthly reports showing gross sales, platform fees, and net payout.',
    icon: (
      <svg
        role="img"
        aria-label="Chart icon"
        className="h-6 w-6 text-yellow-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 18h16.5m-16.5 0H6a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 016 4.5h12a2.25 2.25 0 012.25 2.25v9"
        />
      </svg>
    ),
  },
  {
    title: 'Monthly Royalty Payments',
    description: 'Get paid every month. Authors keep 75% of net royalties earned.',
    icon: (
      <svg
        role="img"
        aria-label="Currency icon"
        className="h-6 w-6 text-yellow-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    title: 'Secure Author Accounts',
    description: 'Password-protected dashboard to track your manuscripts, scores, and earnings.',
    icon: (
      <svg
        role="img"
        aria-label="Settings icon"
        className="h-6 w-6 text-yellow-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43l-.169.225a.25.25 0 00.384.32l.337-.38a.75.75 0 00-.358-1.362zm-7.029-5.912a6 6 0 00-7.029 5.912c.563.097 1.159-.026 1.563-.43l.169-.225a.25.25 0 00-.384-.32l-.337.38a.75.75 0 00.358 1.362z"
        />
      </svg>
    ),
  },
  {
    title: 'Manuscript Privacy',
    description:
      'Your unpublished work is kept strictly confidential. We never share or expose drafts.',
    icon: (
      <svg
        role="img"
        aria-label="Lock icon"
        className="h-6 w-6 text-yellow-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
        />
      </svg>
    ),
  },
  {
    title: 'Bookstore Listings',
    description: 'Your book appears on Amazon, Barnes & Noble, Apple Books, Kobo, and more.',
    icon: (
      <svg
        role="img"
        aria-label="Globe icon"
        className="h-6 w-6 text-yellow-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
        />
      </svg>
    ),
  },
];

export function BenefitsSection() {
  return (
    <section className="section bg-slate-900">
      <div className="container-page">
        <div className="mb-12 text-center">
          <p className="text-eyebrow mb-3 text-yellow-500/70">Author Benefits</p>
          <h2 className="font-display text-h2 font-bold tracking-tight text-slate-100">
            Built for Authors, Not Publishers
          </h2>
          <p className="mt-3 text-body-lg text-slate-400">
            Every decision prioritizes your control, clarity, and earnings.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="border-slate-700/60 bg-slate-800/50">
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="mt-1 shrink-0">{benefit.icon}</div>
                <div>
                  <h3 className="mb-1 text-h4 font-semibold text-slate-100">{benefit.title}</h3>
                  <p className="text-small leading-relaxed text-slate-400">{benefit.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
