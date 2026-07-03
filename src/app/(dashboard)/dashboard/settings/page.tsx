import type { Metadata } from 'next';
import SettingsClient from './settings-client';

export const metadata: Metadata = {
  title: 'Settings — Author Bridge Publishing',
  description: 'Manage your account and payout preferences.',
};

export default function SettingsPage() {
  return <SettingsClient />;
}
