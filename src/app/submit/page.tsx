// @app:user-owned — manuscript submission page (replaces prototype).
import type { Metadata } from 'next';
import { SubmissionForm } from '@/components/custom/submission-form';

export const metadata: Metadata = {
  title: 'Submit Your Manuscript',
  description: 'Upload your manuscript for AI-powered analysis and professional publishing.',
};

export default function SubmitPage() {
  return (
    <main className="min-h-dvh px-gutter py-section bg-[var(--background)]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-20%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[var(--brand-100)] opacity-30 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[var(--brand-200)] opacity-20 blur-3xl" />
      </div>
      <div className="relative">
        <div className="text-center mb-10">
          <h1 className="font-display text-h1 font-bold tracking-tight text-foreground">
            Submit Your Manuscript
          </h1>
          <p className="mt-3 text-body-lg text-muted-foreground max-w-xl mx-auto">
            Upload your manuscript and let our AI analyze it for publishing readiness. Approved
            manuscripts move to our formatting and distribution pipeline.
          </p>
        </div>
        <SubmissionForm />
      </div>
    </main>
  );
}
