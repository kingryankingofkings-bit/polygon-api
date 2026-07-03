import type { Metadata } from 'next';
import { AIReviewSection } from '../(landing)/components/ai-review-section';
import { BenefitsSection } from '../(landing)/components/benefits-section';
import { GenreSection } from '../(landing)/components/genre-section';
import { HeroSection } from '../(landing)/components/hero-section';
import { HowItWorksSection } from '../(landing)/components/how-it-works-section';
import { PricingSection } from '../(landing)/components/pricing-section';
import { TrustSection } from '../(landing)/components/trust-section';

export const metadata: Metadata = {
  title: 'AuthorBridge Publishing',
  description:
    'AI-powered manuscript publishing for independent authors. Professional formatting, ISBN registration, and bookstore distribution. Retain full rights. Earn monthly royalties.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <HowItWorksSection />
      <PricingSection />
      <AIReviewSection />
      <GenreSection />
      <BenefitsSection />
      <TrustSection />
    </main>
  );
}
