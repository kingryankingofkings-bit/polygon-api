// @polsia:user-owned — Author profile page with public profile + payout settings.
'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch } from '@/lib/api-client';
import { signOut, useSession } from '@/lib/auth-client';
import type { AuthorProfile } from '@/lib/contracts/auth';

const GENRE_OPTIONS = [
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

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const [_profile, setProfile] = useState<AuthorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [penName, setPenName] = useState('');
  const [bio, setBio] = useState('');
  const [genrePrefs, setGenrePrefs] = useState<string[]>([]);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await apiFetch<{ penName?: string; bio?: string; genrePrefs: string[] }>(
        '/api/auth/profile',
      );
      setProfile(data as AuthorProfile);
      setPenName((data as AuthorProfile).penName ?? '');
      setBio((data as AuthorProfile).bio ?? '');
      setGenrePrefs((data as AuthorProfile).genrePrefs ?? []);
    } catch {
      // Author may not exist yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    fetchProfile();
  }, [session, fetchProfile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const updated = await apiFetch<AuthorProfile>('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ penName, bio, genrePrefs }),
      });
      setProfile(updated as AuthorProfile);
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile. Try again.' });
    } finally {
      setSaving(false);
    }
  }

  function toggleGenre(genre: string) {
    setGenrePrefs((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  }

  if (isPending || loading) {
    return (
      <main className="min-h-dvh flex items-center justify-center px-gutter bg-[var(--background)]">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="min-h-dvh flex items-center justify-center px-gutter py-section bg-[var(--background)]">
        <Card className="w-full max-w-md shadow-brand border border-border/60 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-h4">Not signed in</CardTitle>
            <CardDescription>Sign in to view your profile</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button asChild className="w-full">
              <a href="/login">Sign in</a>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-dvh px-gutter py-section bg-[var(--background)]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-20%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[var(--brand-100)] opacity-30 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[var(--brand-200)] opacity-20 blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[var(--brand-200)] flex items-center justify-center text-h3 font-bold text-brand-700 select-none">
            {session.user.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div>
            <h1 className="text-h3 font-bold text-foreground">{session.user.name}</h1>
            <p className="text-muted-foreground text-body">{session.user.email}</p>
          </div>
        </div>

        <Separator className="my-6" />

        <form onSubmit={handleSave}>
          <Card className="shadow-brand border border-border/60 bg-card/95 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-h4">Author Profile</CardTitle>
              <CardDescription>
                Your public author profile — visible on your author page
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="penName">Pen Name</Label>
                <Input
                  id="penName"
                  value={penName}
                  onChange={(e) => setPenName(e.target.value)}
                  placeholder="How you appear to readers"
                  maxLength={100}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">Author Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell readers about yourself and your writing"
                  rows={4}
                  maxLength={2000}
                />
              </div>
              <div className="grid gap-2">
                <Label>Genre Preferences</Label>
                <div className="flex flex-wrap gap-2">
                  {GENRE_OPTIONS.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        genrePrefs.includes(genre)
                          ? 'bg-brand-100 border-brand-500 text-brand-700'
                          : 'bg-card border-border hover:border-brand-300 hover:text-brand-600'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {message && (
                <p
                  className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-destructive'}`}
                >
                  {message.text}
                </p>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Profile'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <div className="mt-6 flex justify-end">
          <Button
            variant="secondary"
            onClick={async () => {
              await signOut();
              window.location.assign('/login');
            }}
          >
            Sign out
          </Button>
        </div>
      </div>
    </main>
  );
}
