import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/admin-guard';
import { AdminRoyaltiesClient } from './admin-royalties-client';

export const metadata: Metadata = {
  title: 'Royalty Management — Author Bridge Publishing',
  description: 'Admin view for author royalty payouts and statements.',
};

export default async function AdminRoyaltiesPage() {
  await requireAdmin();
  return <AdminRoyaltiesClient />;
}
