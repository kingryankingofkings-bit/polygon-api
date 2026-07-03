// @polsia:user-owned — manuscript scoring form island. 'use client' component
// that handles manuscript input, API submission, and results display.
'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch } from '@/lib/api-client';
import { ScoreResponse } from '@/lib/contracts/score';

function ScoreCard({
  dimension,
}: {
  dimension: { name: string; score: number; feedback: string };
}) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-h4 font-semibold text-card-foreground">
            {dimension.name}
          </CardTitle>
          <span className="font-display text-2xl font-bold text-brand-600">
            {dimension.score.toFixed(1)}
            <span className="text-small text-muted-foreground">/10</span>
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress
          value={dimension.score * 10}
          className="h-2 w-full"
          aria-label={`${dimension.name} score: ${dimension.score}/10`}
        />
        <CardDescription className="text-body text-muted-foreground leading-relaxed">
          {dimension.feedback}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

export function ScoreForm() {
  const [manuscript, setManuscript] = useState('');
  const [genre, setGenre] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await apiFetch('/api/score', {
        method: 'POST',
        body: JSON.stringify({ manuscript, genre: genre || undefined }),
        schema: ScoreResponse,
      });
      setResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex flex-col gap-12 py-section">
      {/* Header */}
      <section className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-h1 font-bold tracking-tight text-foreground">
            Score Your Manuscript
          </h1>
          <p className="mt-4 text-body-lg text-muted-foreground leading-relaxed">
            Paste your manuscript below for AI-powered analysis across five dimensions. Receive a
            detailed breakdown and a pass/fail recommendation.
          </p>
        </div>
      </section>

      <Separator />

      {/* Form */}
      <section className="container-page">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="manuscript" className="text-small font-medium text-foreground">
                Manuscript Text
              </label>
              <Textarea
                id="manuscript"
                value={manuscript}
                onChange={(e) => setManuscript(e.target.value)}
                placeholder="Paste your manuscript here..."
                className="min-h-[200px] w-full resize-y border-border bg-card text-foreground placeholder:text-muted-foreground"
                required
                minLength={100}
              />
              <p className="text-caption text-muted-foreground">
                Minimum 100 characters. For best results, paste at least a chapter or section.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="genre" className="text-small font-medium text-foreground">
                Genre <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                id="genre"
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Fantasy, Thriller, Literary Fiction"
                className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-small text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isLoading || manuscript.length < 100}
              className="w-full"
            >
              {isLoading ? 'Analyzing...' : 'Score My Manuscript'}
            </Button>
          </form>
        </div>
      </section>

      {/* Results */}
      {result && (
        <>
          <Separator />
          <section className="container-page">
            <div className="mx-auto max-w-3xl space-y-8">
              {/* Summary badges */}
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-display text-6xl font-bold text-brand-600">
                    {result.score.toFixed(1)}
                  </span>
                  <span className="text-small text-muted-foreground">Composite Score</span>
                </div>
                <Badge
                  variant={result.passed ? 'default' : 'destructive'}
                  className="text-h4 px-6 py-2 font-semibold"
                >
                  {result.passed ? 'PASS' : 'REVISION NEEDED'}
                </Badge>
              </div>

              {/* Per-dimension cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                {result.dimensions.map((dim) => (
                  <ScoreCard key={dim.name} dimension={dim} />
                ))}
              </div>

              {/* Overall feedback */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-h4 font-semibold text-card-foreground">
                    Overall Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-body leading-relaxed text-muted-foreground">
                    {result.overallFeedback}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
