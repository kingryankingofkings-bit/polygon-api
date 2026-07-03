import type { Metadata } from 'next';
import { RoyaltiesClient } from './royalties-client';

export const metadata: Metadata = {
  title: 'Royalties — Author Bridge Publishing',
  description: 'Track your earnings, view statements, and monitor payout status.',
};

export default function RoyaltiesPage() {
  return <RoyaltiesClient />;
}
