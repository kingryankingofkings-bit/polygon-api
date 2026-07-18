import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Authors — Babylon The Path Publishing',
  description: 'Discover the talented authors published by BabylonThePath.',
};

export default async function AuthorsDirectoryPage() {
  const authors = await prisma.author.findMany({
    where: {
      penName: { not: null },
    },
    orderBy: { penName: 'asc' },
  });

  return (
    <main className="min-h-dvh px-gutter py-section bg-[var(--background)]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-20%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[var(--brand-100)] opacity-30 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[var(--brand-200)] opacity-20 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        <h1 className="text-h2 font-bold text-foreground mb-4">Our Authors</h1>
        <p className="text-body text-muted-foreground mb-8">
          Discover the talented writers who bring our stories to life.
        </p>

        {authors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {authors.map((author) => {
              const penName = author.penName || 'Anonymous';
              return (
                <Link 
                  key={author.id} 
                  href={`/authors/${encodeURIComponent(penName)}`}
                  className="block p-6 border rounded-xl bg-card hover:border-brand-500 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[var(--brand-200)] flex items-center justify-center text-lg font-bold text-brand-700">
                      {penName.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">{penName}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {author.bio || 'This author has not provided a biography yet.'}
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground p-8 text-center border rounded-xl bg-card">
            No authors found.
          </p>
        )}
      </div>
    </main>
  );
}
