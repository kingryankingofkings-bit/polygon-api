export function TrustSection() {
  return (
    <section className="py-section-lg bg-slate-950">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-slate-700" />
            <div className="h-1.5 w-1.5 rounded-full bg-yellow-500/50" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-slate-700" />
          </div>
          <p className="text-small text-slate-600">
            Advisory only. Does not guarantee sales, originality, or market acceptance. Human review
            recommended before official submission.
          </p>
        </div>
      </div>
    </section>
  );
}
