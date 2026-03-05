import LandingNav from '@/components/landing/LandingNav';
import HeroSection from '@/components/landing/HeroSection';
import LogoBar from '@/components/landing/LogoBar';
import ProblemSection from '@/components/landing/ProblemSection';
import FeatureShowcase from '@/components/landing/FeatureShowcase';
import OpenClawSection from '@/components/landing/OpenClawSection';
import HowItWorks from '@/components/landing/HowItWorks';
import AgentDeepDive from '@/components/landing/AgentDeepDive';
import PricingSection from '@/components/landing/PricingSection';
import StatsSection from '@/components/landing/StatsSection';
import Testimonials from '@/components/landing/Testimonials';
import FAQSection from '@/components/landing/FAQSection';
import FinalCTA from '@/components/landing/FinalCTA';
import LandingFooter from '@/components/landing/LandingFooter';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[hsl(var(--marketing-surface))]">
      <LandingNav />
      <HeroSection />
      <LogoBar />
      <ProblemSection />
      <FeatureShowcase />
      <OpenClawSection />
      <HowItWorks />
      <AgentDeepDive />
      <PricingSection />
      <StatsSection />
      <Testimonials />
      <FAQSection />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
