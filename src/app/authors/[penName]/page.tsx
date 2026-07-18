import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';

interface Props {
  params: Promise<{ penName: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { penName } = await params;
  return {
    title: `${penName} — Babylon The Path Publishing`,
    description: `View ${penName}'s author profile and published works on BabylonThePath.`,
  };
}

export default async function AuthorProfilePage({ params }: Props) {
  const { penName } = await params;

  const author = await prisma.author.findFirst({
    where: {
      penName: { equals: decodeURIComponent(penName), mode: 'insensitive' },
    },
    include: {
      manuscripts: {
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
      },
    },
  });

  if (!author) {
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
            {author.penName?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-h2 font-bold text-foreground">{author.penName || 'Anonymous'}</h1>
            <p className="text-muted-foreground text-body">Author on BabylonThePath</p>
          </div>
        </div>

        {/* Bio */}
        <section className="mb-8">
          <h2 className="text-h4 font-semibold text-foreground mb-3">About</h2>
          <p className="text-body leading-relaxed text-muted-foreground">
            {author.bio || 'This author has not provided a biography yet.'}
          </p>
        </section>

        {/* Published Works */}
        <section>
          <h2 className="text-h4 font-semibold text-foreground mb-3">Published Works</h2>
          {author.manuscripts.length > 0 ? (
            <ul className="space-y-4">
              {author.manuscripts.map((ms) => (
                <li key={ms.id} className="p-4 border rounded-md bg-card">
                  <h3 className="text-lg font-medium text-foreground">{ms.title}</h3>
                  {ms.genre && <span className="text-xs text-brand-600 font-semibold">{ms.genre}</span>}
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {ms.blurb || 'No description provided.'}
                  </p>
                  {ms.publishedUrl && (
                    <div className="mt-3">
                      <Link href={ms.publishedUrl} target="_blank" className="text-sm text-brand-600 hover:underline">
                        View/Buy Book
                      </Link>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No published works yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
