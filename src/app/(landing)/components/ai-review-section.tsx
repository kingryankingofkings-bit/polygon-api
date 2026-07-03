import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const analysisItems = [
  'Genre fit & market positioning',
  'Commercial viability assessment',
  'Narrative structure evaluation',
  'Pacing & tension management',
  'Prose quality & style review',
  'Readability & audience clarity',
  'Commercial positioning analysis',
];

export function AIReviewSection() {
  return (
    <section id="ai-review" className="section bg-slate-900">
      <div className="container-page">
        <div className="mb-12 text-center">
          <p className="text-eyebrow mb-3 text-yellow-500/70">AI Manuscript Analysis</p>
          <h2 className="font-display text-h2 font-bold tracking-tight text-slate-100">
            Free AI Review Before You Publish
          </h2>
          <p className="mt-3 text-body-lg text-slate-400">
            Receive a detailed scoring across seven dimensions — honest, not flattering.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2">
          {/* Feature list */}
          <Card className="border-slate-700/60 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-h4 font-semibold text-slate-100">
                What&apos;s Analyzed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysisItems.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-body text-slate-300">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-yellow-500/10">
                      <svg
                        role="img"
                        aria-label="Checkmark"
                        className="h-3 w-3 text-yellow-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Score threshold callout */}
          <Card className="border-yellow-500/30 bg-yellow-500/5 shadow-lg ring-1 ring-yellow-500/20">
            <CardHeader>
              <CardTitle className="text-h4 font-semibold text-yellow-500">
                Minimum Score Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-display text-6xl font-bold text-yellow-500">8.5</span>
                <span className="text-h3 font-bold text-slate-300">/10</span>
                <span className="text-body text-slate-400">to proceed</span>
              </div>
              <p className="text-body leading-relaxed text-slate-400">
                Manuscripts scoring below 8.5 receive actionable feedback to help strengthen the
                work before resubmission. There is no penalty for reattempting.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <div className="mx-auto mt-8 max-w-2xl text-center">
          <p className="text-small text-slate-600">
            Advisory only. Does not guarantee sales, originality, or market acceptance. Human review
            recommended before official submission.
          </p>
        </div>
      </div>
    </section>
  );
}
