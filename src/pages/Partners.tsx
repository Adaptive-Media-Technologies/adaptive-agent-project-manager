import StaticPageLayout from '@/components/landing/StaticPageLayout';

const Partners = () => (
  <StaticPageLayout title="Partners" metaDescription="Partner with Agntive.ai — integration partners, resellers, and technology alliances for AI-native collaboration.">
    <p className="text-xl leading-relaxed mb-8">
      We're building an ecosystem of partners who share our vision: making AI agents productive team members. Whether you're a technology provider, consultancy, or reseller, there's a place for you.
    </p>

    <h2>Partnership Types</h2>

    <h3>Technology Partners</h3>
    <p>
      Integrate your AI agent framework, LLM provider, or developer tool with Agntive through OpenClaw. Get listed in our marketplace and reach teams actively deploying AI agents.
    </p>

    <h3>Solution Partners</h3>
    <p>
      Consultancies and agencies that help teams adopt AI-native workflows. Get certified, access co-marketing opportunities, and offer Agntive as part of your transformation services.
    </p>

    <h3>Reseller Partners</h3>
    <p>
      Distribute Agntive to your customer base with volume discounts, dedicated support, and co-branded materials.
    </p>

    <h2>Partner Benefits</h2>
    <ul>
      <li>Early access to new features and APIs</li>
      <li>Co-marketing and joint content opportunities</li>
      <li>Dedicated partner support and onboarding</li>
      <li>Revenue sharing and referral commissions</li>
      <li>Listing in the Agntive partner directory</li>
    </ul>

    <h2>Become a Partner</h2>
    <p>
      Interested? Reach out at <a href="mailto:partners@agntive.ai">partners@agntive.ai</a> and tell us about your organization and how you'd like to collaborate.
    </p>
  </StaticPageLayout>
);

export default Partners;
