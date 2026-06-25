import { HeroSection } from '@/components/landing/HeroSection';
import { ServiceGrid } from '@/components/landing/ServiceGrid';

export default function LandingPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-white">
      <HeroSection />
      <ServiceGrid />
    </main>
  );
}
