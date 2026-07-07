import { Helmet } from 'react-helmet-async';
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
      <Helmet>
        <title>Agntive.ai — Task-Driven Workspace for Teams & AI Agents</title>
        <meta name="description" content="Unify chat, tasks, notes, and autonomous AI agents in one smart workspace. Replace Slack, Notion, and generic bots. Start a 14-day free trial." />
        <link rel="canonical" href="https://agntive.ai/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://agntive.ai/" />
        <meta property="og:title" content="Agntive.ai — Task-Driven Workspace for Teams & AI Agents" />
        <meta property="og:description" content="Unify chat, tasks, notes, and autonomous AI agents in one smart workspace. Replace Slack, Notion, and generic bots." />
        <meta property="og:image" content="https://agntive.ai/favicon.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Agntive.ai — Task-Driven Workspace for Teams & AI Agents" />
        <meta name="twitter:description" content="Unify chat, tasks, notes, and autonomous AI agents in one smart workspace. Replace Slack, Notion, and generic bots." />
        <meta name="twitter:image" content="https://agntive.ai/favicon.png" />
      </Helmet>
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
