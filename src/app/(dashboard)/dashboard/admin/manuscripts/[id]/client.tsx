'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, UploadCloud, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { ManuscriptStatus } from '@prisma/client';

interface Props {
  id: string;
  status: ManuscriptStatus;
  hasCover: boolean;
  publishedUrl: string | null;
}

export function ManuscriptDetailClient({ id, status, hasCover, publishedUrl }: Props) {
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function handleDownload(type: 'manuscript' | 'cover') {
    try {
      const res = await fetch(`/api/admin/manuscripts/${id}/download?type=${type}`);
      if (!res.ok) throw new Error('Download failed');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // The server sets the filename in Content-Disposition
      const cd = res.headers.get('Content-Disposition');
      let filename = 'download';
      if (cd && cd.includes('filename="')) {
        filename = cd.split('filename="')[1]?.split('"')[0] || 'download';
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      toast.error(`Failed to download ${type}`);
    }
  }

  async function handleUpdateStatus(newStatus: ManuscriptStatus) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/manuscripts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success(`Status updated to ${newStatus}`);
      router.refresh();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  }

  async function handleAutomatedPublish() {
    if (!confirm('This will trigger the headless browser to log into Draft2Digital and publish the book. Continue?')) {
      return;
    }
    setPublishing(true);
    try {
      const res = await fetch(`/api/admin/manuscripts/${id}/publish`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Publish failed');
      toast.success('Automated publish sequence completed successfully!');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Automated publish failed');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
        <CardDescription>Manage files and publishing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex flex-col">
        <Button variant="outline" className="w-full justify-start" onClick={() => handleDownload('manuscript')}>
          <Download className="mr-2 h-4 w-4" /> Download Manuscript
        </Button>
        {hasCover && (
          <Button variant="outline" className="w-full justify-start" onClick={() => handleDownload('cover')}>
            <Download className="mr-2 h-4 w-4" /> Download Cover
          </Button>
        )}
        
        <div className="pt-4 border-t">
          {status !== 'PUBLISHED' && (
            <Button 
              className="w-full justify-start" 
              onClick={handleAutomatedPublish}
              disabled={publishing || updating || status === 'PUBLISHING'}
            >
              {publishing ? (
                <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Publishing...</>
              ) : (
                <><UploadCloud className="mr-2 h-4 w-4" /> Automated Publish (D2D)</>
              )}
            </Button>
          )}
        </div>

        <div className="pt-4 border-t flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground mb-1">Manual Status Override</p>
          <Button variant="secondary" disabled={updating} onClick={() => handleUpdateStatus('REVIEW')}>Mark as REVIEW</Button>
          <Button variant="secondary" disabled={updating} onClick={() => handleUpdateStatus('APPROVED')}>Mark as APPROVED</Button>
          <Button variant="secondary" disabled={updating} onClick={() => handleUpdateStatus('AWAITING_PAYMENT')}>Mark as AWAITING_PAYMENT</Button>
          <Button variant="default" disabled={updating} onClick={() => handleUpdateStatus('PUBLISHED')}>Mark as PUBLISHED</Button>
          <Button variant="destructive" disabled={updating} onClick={() => handleUpdateStatus('REJECTED')}>Mark as REJECTED</Button>
        </div>
      </CardContent>
    </Card>
  );
}
