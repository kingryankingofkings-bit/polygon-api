import 'server-only';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function requireAdminApi() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'admin') {
    throw NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return session;
}
