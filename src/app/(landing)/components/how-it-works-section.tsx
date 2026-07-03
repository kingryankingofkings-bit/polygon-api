import { Card, CardContent } from '@/components/ui/card';

const steps = [
  {
    number: '1',
    title: 'Upload Manuscript',
    description:
      'Submit your manuscript as a Word doc, PDF, or text file. Our system accepts works from 1,000 to 500,000+ words.',
  },
  {
    number: '2',
    title: 'AI Analysis & Scoring',
    description:
      'Our AI reviews your manuscript across six dimensions — genre fit, marketability, structure, pacing, prose, and readability. A minimum 8.5/10 score is required to proceed.',
  },
  {
    number: '3',
    title: 'Professional Formatting & Publishing',
    description:
      'Once approved, we handle interior layout, cover design, ISBN registration (optional), and conversion to all major ebook and print formats.',
  },
  {
    number: '4',
    title: 'Bookstore Distribution & Royalties',
    description:
      'Your book is listed across major online bookstores. Authors keep 75% of net royalties, paid monthly with transparent statements.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section bg-slate-900">
      <div className="container-page">
        <div className="mb-12 text-center">
          <p className="text-eyebrow mb-3 text-yellow-500/70">Process</p>
          <h2 className="font-display text-h2 font-bold tracking-tight text-slate-100">
            How It Works
          </h2>
          <p className="mt-3 text-body-lg text-slate-400">
            From raw manuscript to bookstore shelf — four straightforward steps.
          </p>
        </div>

        {/* Stepper */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connector line between cards */}
              {i < steps.length - 1 && (
                <div
                  className="absolute left-1/2 top-8 z-0 hidden h-px w-full -translate-y-1/2 lg:block"
                  style={{ left: 'calc(50% + 3rem)' }}
                >
                  <div className="h-px w-full bg-gradient-to-r from-yellow-500/40 to-transparent" />
                </div>
              )}
              <Card className="relative z-10 border-slate-700/60 bg-slate-800/50 shadow-lg">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/10">
                    <span className="font-display text-lg font-bold text-yellow-500">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="mb-2 text-h4 font-semibold text-slate-100">{step.title}</h3>
                  <p className="text-small leading-relaxed text-slate-400">{step.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
