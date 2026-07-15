// @app:user-owned
import { AiReviewSection } from './components/ai-review-section';
import { BenefitsSection } from './components/benefits-section';
import { GenreSection } from './components/genre-section';
import { HeroSection } from './components/hero-section';
import { HowItWorksSection } from './components/how-it-works-section';
import { PricingSection } from './components/pricing-section';
import { TrustSection } from './components/trust-section';

export default function LandingPage() {
  return (
    <main className="flex flex-col">
      <HeroSection />
      <HowItWorksSection />
      <AiReviewSection />
      <BenefitsSection />
      <GenreSection />
      <TrustSection />
      <PricingSection />
    </main>
  );
}
