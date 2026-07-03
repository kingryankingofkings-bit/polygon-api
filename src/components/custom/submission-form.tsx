// @app:user-owned — manuscript submission form island.
// Multi-step: 1) upload file, 2) metadata, 3) rights confirmation, 4) submit.
'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch } from '@/lib/api-client';
import { useSession } from '@/lib/auth-client';
import type { UploadResponse } from '@/lib/contracts/manuscript';

const GENRES = [
  'Fantasy',
  'Science Fiction',
  'Romance',
  'Mystery',
  'Thriller',
  'Horror',
  'Literary Fiction',
  'Historical Fiction',
  'Young Adult',
  'Children',
  'Non-Fiction',
  'Memoir',
  'Poetry',
  'Other',
];

const AGE_CATEGORIES = ['Children', 'Middle Grade', 'Young Adult', 'Adult', 'All Ages'];

const STEPS = ['Upload', 'Details', 'Review', 'Submit'];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              i < current
                ? 'bg-brand-600 text-white'
                : i === current
                  ? 'bg-brand-100 border-2 border-brand-600 text-brand-700'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {i < current ? '✓' : i + 1}
          </div>
          <span
            className={`text-small hidden sm:inline ${i === current ? 'font-medium' : 'text-muted-foreground'}`}
          >
            {label}
          </span>
          {i < STEPS.length - 1 && (
            <div className={`w-8 h-px ${i < current ? 'bg-brand-300' : 'bg-border'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function SubmissionForm() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // File step
  const [manuscriptFile, setManuscriptFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Details step
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [genre, setGenre] = useState('');
  const [subgenre, setSubgenre] = useState('');
  const [blurb, setBlurb] = useState('');
  const [keywords, setKeywords] = useState('');
  const [ageCategory, setAgeCategory] = useState('');

  // Review
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [ipAddress, _setIpAddress] = useState('');

  async function handleUpload() {
    if (!manuscriptFile) return;
    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', manuscriptFile);
      if (coverImage) formData.append('coverImage', coverImage);

      // Use fetch directly since this is multipart
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      setUploadResult(data);
      setStep(1);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handleDetailsNext() {
    if (!title.trim()) return;
    setStep(2);
  }

  function handleSubmit() {
    if (!rightsConfirmed || !uploadResult) return;
    setSubmitting(true);

    apiFetch<{ id: string }>('/api/manuscripts', {
      method: 'POST',
      body: JSON.stringify({
        title,
        subtitle: subtitle || undefined,
        genre,
        subgenre: subgenre || undefined,
        blurb: blurb || undefined,
        keywords: keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
        ageCategory: ageCategory || undefined,
        contentWarnings: [],
        filePath: uploadResult.filePath,
        fileName: uploadResult.fileName,
        fileSize: manuscriptFile?.size ?? 0,
        mimeType: manuscriptFile?.type ?? 'application/octet-stream',
        coverImagePath: uploadResult.coverImagePath,
        wordCount: uploadResult.wordCount,
        rightsConfirmedAt: new Date().toISOString(),
        rightsConfirmedIp: ipAddress,
      }),
    })
      .then((data) => {
        router.push(`/submit/success?manuscript_id=${data.id}`);
      })
      .catch((err) => {
        setUploadError(err instanceof Error ? err.message : 'Submission failed');
        setSubmitting(false);
      });
  }

  if (isPending) {
    return <p className="text-center text-muted-foreground py-12">Loading…</p>;
  }

  if (!session?.user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">You must be signed in to submit a manuscript.</p>
        <Button asChild>
          <a href="/login">Sign In</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <StepIndicator current={step} />

      {/* Step 0: Upload */}
      {step === 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-h3">Upload Your Manuscript</CardTitle>
            <CardDescription>
              Upload your manuscript file (PDF, DOCX, RTF) and optional cover image.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="manuscript">Manuscript File *</Label>
              <input
                ref={fileInputRef}
                id="manuscript"
                type="file"
                accept=".pdf,.docx,.doc,.rtf"
                onChange={(e) => setManuscriptFile(e.target.files?.[0] ?? null)}
                className="flex w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-border file:text-small file:font-medium file:bg-card hover:file:bg-secondary"
              />
              {manuscriptFile && (
                <p className="text-small text-muted-foreground">Selected: {manuscriptFile.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover">
                Cover Image <span className="text-muted-foreground">(optional)</span>
              </Label>
              <input
                ref={coverInputRef}
                id="cover"
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
                className="flex w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-border file:text-small file:font-medium file:bg-card hover:file:bg-secondary"
              />
              {coverImage && (
                <p className="text-small text-muted-foreground">Selected: {coverImage.name}</p>
              )}
            </div>

            {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}

            <Button
              onClick={handleUpload}
              disabled={!manuscriptFile || uploading}
              className="w-full"
            >
              {uploading ? 'Uploading…' : 'Continue'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Details */}
      {step === 1 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-h3">Manuscript Details</CardTitle>
            <CardDescription>
              Tell us about your manuscript. Fields marked * are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={300}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                maxLength={300}
              />
            </div>
            <div className="grid gap-2">
              <Label>Genre *</Label>
              <RadioGroup value={genre} onValueChange={setGenre} className="flex flex-wrap gap-3">
                {GENRES.map((g) => (
                  <div key={g} className="flex items-center gap-1.5">
                    <RadioGroupItem value={g} id={`genre-${g}`} />
                    <Label htmlFor={`genre-${g}`} className="text-small cursor-pointer">
                      {g}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subgenre">Subgenre</Label>
              <Input
                id="subgenre"
                value={subgenre}
                onChange={(e) => setSubgenre(e.target.value)}
                placeholder="e.g. Epic Fantasy, Cozy Mystery"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="blurb">Description / Blurb</Label>
              <Textarea
                id="blurb"
                value={blurb}
                onChange={(e) => setBlurb(e.target.value)}
                placeholder="A brief description of your story..."
                rows={4}
                maxLength={2000}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="keywords">
                Keywords <span className="text-muted-foreground">(comma-separated)</span>
              </Label>
              <Input
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="dragons, magic, quest"
              />
            </div>
            <div className="grid gap-2">
              <Label>Age Category *</Label>
              <RadioGroup
                value={ageCategory}
                onValueChange={setAgeCategory}
                className="flex flex-wrap gap-3"
              >
                {AGE_CATEGORIES.map((a) => (
                  <div key={a} className="flex items-center gap-1.5">
                    <RadioGroupItem value={a} id={`age-${a}`} />
                    <Label htmlFor={`age-${a}`} className="text-small cursor-pointer">
                      {a}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Separator className="pt-2" />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button
                onClick={handleDetailsNext}
                disabled={!title.trim() || !genre || !ageCategory}
                className="flex-1"
              >
                Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-h3">Review & Confirm</CardTitle>
            <CardDescription>Review your submission details and confirm rights.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 text-small">
              <div className="flex justify-between">
                <span className="text-muted-foreground">File:</span>
                <span className="font-medium">{manuscriptFile?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Word count:</span>
                <span className="font-medium">
                  {uploadResult?.wordCount.toLocaleString() ?? '—'}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Title:</span>
                <span className="font-medium">{title}</span>
              </div>
              {subtitle && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtitle:</span>
                  <span className="font-medium">{subtitle}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Genre:</span>
                <span className="font-medium">{genre}</span>
              </div>
              {subgenre && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subgenre:</span>
                  <span className="font-medium">{subgenre}</span>
                </div>
              )}
              {ageCategory && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Age category:</span>
                  <span className="font-medium">{ageCategory}</span>
                </div>
              )}
              {blurb && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blurb:</span>
                  <span className="font-medium max-w-[60%] text-right">
                    {blurb.slice(0, 80)}
                    {blurb.length > 80 ? '…' : ''}
                  </span>
                </div>
              )}
              {keywords && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Keywords:</span>
                  <span className="font-medium">{keywords}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex gap-3">
                <Checkbox
                  id="rights"
                  checked={rightsConfirmed}
                  onCheckedChange={(checked) => setRightsConfirmed(checked === true)}
                />
                <Label htmlFor="rights" className="text-small leading-relaxed cursor-pointer">
                  I confirm that I hold the rights to this manuscript, it is not plagiarized, and I
                  agree to the platform&apos;s terms of service and AI-content disclosure
                  requirements. I understand that submitting false information may result in removal
                  from the platform.
                </Label>
              </div>
            </div>

            {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!rightsConfirmed || submitting}
                className="flex-1"
              >
                {submitting ? 'Submitting…' : 'Submit Manuscript'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
