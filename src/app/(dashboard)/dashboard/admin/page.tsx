import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default async function AdminDashboardPage() {
  await requireAdmin();

  const manuscripts = await prisma.manuscript.findMany({
    include: {
      author: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage manuscript submissions and publishing pipeline.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Review and publish author manuscripts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-4 p-4 font-medium text-sm text-muted-foreground border-b bg-muted/50">
              <div>Author</div>
              <div>Manuscript</div>
              <div>Submitted</div>
              <div>Status</div>
              <div className="w-10"></div>
            </div>
            
            <div className="divide-y">
              {manuscripts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No manuscripts submitted yet.</div>
              ) : (
                manuscripts.map((doc) => (
                  <div key={doc.id} className="grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-4 p-4 items-center text-sm hover:bg-muted/30 transition-colors">
                    <div className="font-medium truncate">
                      {doc.author.penName || doc.author.legalName || 'Unknown Author'}
                    </div>
                    <div>
                      <div className="font-medium text-foreground truncate">{doc.title}</div>
                      <div className="text-muted-foreground text-xs truncate mt-0.5">{doc.genre} • {doc.wordCount.toLocaleString()} words</div>
                    </div>
                    <div className="text-muted-foreground">
                      {formatDistanceToNow(doc.createdAt, { addSuffix: true })}
                    </div>
                    <div>
                      <Badge variant={
                        doc.status === 'PUBLISHED' ? 'default' : 
                        doc.status === 'PUBLISHING' ? 'secondary' : 
                        doc.status === 'REJECTED' ? 'destructive' : 'outline'
                      }>
                        {doc.status}
                      </Badge>
                    </div>
                    <div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/admin/manuscripts/${doc.id}`}>
                          <ChevronRight className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
