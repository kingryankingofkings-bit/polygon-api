import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ManuscriptDetailClient } from './client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default async function AdminManuscriptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const { id } = await params;
  const manuscript = await prisma.manuscript.findUnique({
    where: { id },
    include: { author: true },
  });

  if (!manuscript) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-8 px-4">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2">
          <Link href="/dashboard/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{manuscript.title}</h1>
            <p className="text-muted-foreground mt-1">
              By {manuscript.author.penName || manuscript.author.legalName || 'Unknown Author'}
            </p>
          </div>
          <Badge variant={
            manuscript.status === 'PUBLISHED' ? 'default' : 
            manuscript.status === 'PUBLISHING' ? 'secondary' : 
            manuscript.status === 'REJECTED' ? 'destructive' : 'outline'
          } className="text-sm px-3 py-1">
            {manuscript.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Manuscript Details</CardTitle>
            <CardDescription>Submitted {formatDistanceToNow(manuscript.createdAt, { addSuffix: true })}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Blurb / Description</h3>
              <p className="text-sm whitespace-pre-wrap">{manuscript.blurb || 'No description provided.'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Genre</h3>
                <p className="text-sm font-medium">{manuscript.genre} {manuscript.subgenre ? `> ${manuscript.subgenre}` : ''}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Word Count</h3>
                <p className="text-sm font-medium">{manuscript.wordCount.toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Age Category</h3>
                <p className="text-sm font-medium">{manuscript.ageCategory || 'Unspecified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">AI Score</h3>
                <p className="text-sm font-medium">{manuscript.score ? `${manuscript.score}/10` : 'Not Scored'}</p>
              </div>
            </div>

            {manuscript.contentWarnings.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Content Warnings</h3>
                <div className="flex flex-wrap gap-2">
                  {manuscript.contentWarnings.map(cw => (
                    <Badge key={cw} variant="secondary">{cw}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {manuscript.publishedUrl && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Live Store URL</h3>
                <a href={manuscript.publishedUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                  {manuscript.publishedUrl}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Author Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium text-muted-foreground mb-1">Legal Name</h3>
                <p>{manuscript.author.legalName || 'Not provided'}</p>
              </div>
              <div>
                <h3 className="font-medium text-muted-foreground mb-1">Payout Pref</h3>
                <p>{manuscript.author.payoutStripe ? 'Stripe Connected' : (manuscript.author.payoutPayPal ? 'PayPal' : 'None setup')}</p>
              </div>
            </CardContent>
          </Card>

          <ManuscriptDetailClient 
            id={manuscript.id} 
            status={manuscript.status} 
            hasCover={!!manuscript.coverImagePath}
            publishedUrl={manuscript.publishedUrl}
          />
        </div>
      </div>
    </div>
  );
}
