import { HeroSection } from '@/components/features/landing/HeroSection';
import { HowItWorks } from '@/components/features/landing/HowItWorks';
import { FeaturedItineraries } from '@/components/features/landing/FeaturedItineraries';
import { SocialProof } from '@/components/features/landing/SocialProof';
import { Pricing } from '@/components/features/landing/Pricing';
import { Footer } from '@/components/features/landing/Footer';

export function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <HowItWorks />
      <FeaturedItineraries />
      <SocialProof />
      <Pricing />
      <Footer />
    </div>
  );
}
