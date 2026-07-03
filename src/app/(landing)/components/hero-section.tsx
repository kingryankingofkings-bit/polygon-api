import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative bg-slate-950 py-section-lg">
      {/* Subtle top gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent" />
      {/* Decorative gold rule */}
      <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent" />

      <div className="container-page relative">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-eyebrow mb-6 text-yellow-500/80">AuthorBridge Publishing</p>

          <h1 className="font-display text-display font-bold tracking-tight text-slate-50">
            Your Manuscript.
            <br />
            <span className="text-yellow-500">Professionally Published.</span>
          </h1>

          <p className="mt-6 text-body-lg leading-relaxed text-slate-300">
            AI-powered manuscript analysis, expert formatting, and bookstore distribution — all in
            one place. Retain full creative control. Earn monthly royalties.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="bg-yellow-500 text-slate-950 hover:bg-yellow-400">
              <a href="/submit">Submit Your Manuscript</a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
            >
              <a href="/#how-it-works">Learn More</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
    </section>
  );
}
