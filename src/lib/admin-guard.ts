// Server-side admin gate — wraps requireAdmin for use in Server Component pages.
// Placed in src/lib/ so the biome override suppresses the require-admin lint rule.
import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'admin') redirect('/');
  return session;
}
