// @app:user-owned — public author profile page. No auth required.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ penName: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { penName } = await params;
  return {
    title: `${penName} — AuthorBridge Publishing`,
    description: `View ${penName}'s author profile and published works on AuthorBridge.`,
  };
}

export default async function AuthorProfilePage({ params }: Props) {
  const { penName } = await params;

  // In production, fetch author by penName from DB
  // For now, show placeholder content
  const authorExists = false; // Replace with actual DB check

  if (!authorExists) {
    notFound();
  }

  return (
    <main className="min-h-dvh px-gutter py-section bg-[var(--background)]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-20%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[var(--brand-100)] opacity-30 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[var(--brand-200)] opacity-20 blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* Author Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-[var(--brand-200)] flex items-center justify-center text-h2 font-bold text-brand-700 select-none">
            {penName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-h2 font-bold text-foreground">{penName}</h1>
            <p className="text-muted-foreground text-body">Author on AuthorBridge</p>
          </div>
        </div>

        {/* Bio */}
        <section className="mb-8">
          <h2 className="text-h4 font-semibold text-foreground mb-3">About</h2>
          <p className="text-body leading-relaxed text-muted-foreground">
            Author biography will appear here.
          </p>
        </section>

        {/* Published Works */}
        <section>
          <h2 className="text-h4 font-semibold text-foreground mb-3">Published Works</h2>
          <p className="text-muted-foreground">No published works yet.</p>
        </section>
      </div>
    </main>
  );
}
