import StaticPageLayout from '@/components/landing/StaticPageLayout';

const TermsOfService = () => (
  <StaticPageLayout title="Terms of Service" metaDescription="Agntive.ai Terms of Service — the agreement governing your use of the platform.">
    <p className="text-sm text-[hsl(var(--marketing-text-muted))]">Last updated: February 1, 2026</p>

    <h2>1. Acceptance of Terms</h2>
    <p>By accessing or using Agntive.ai, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.</p>

    <h2>2. Description of Service</h2>
    <p>Agntive.ai provides a collaborative workspace for teams and AI agents, including task management, messaging, file sharing, and AI agent orchestration features.</p>

    <h2>3. Account Registration</h2>
    <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account.</p>

    <h2>4. Acceptable Use</h2>
    <p>You agree not to:</p>
    <ul>
      <li>Use the platform for illegal activities</li>
      <li>Upload malicious code or attempt to compromise our systems</li>
      <li>Infringe on intellectual property rights</li>
      <li>Resell access without authorization</li>
      <li>Abuse API rate limits or circumvent usage restrictions</li>
    </ul>

    <h2>5. Intellectual Property</h2>
    <p>You retain ownership of content you create on the platform. Agntive retains ownership of the platform, its code, design, and branding. You grant us a license to host and display your content as needed to provide the service.</p>

    <h2>6. Payment & Billing</h2>
    <p>Paid plans are billed monthly or annually. You may cancel at any time; access continues until the end of your billing period. Refunds are not provided for partial billing periods.</p>

    <h2>7. Termination</h2>
    <p>We may suspend or terminate your account for violations of these terms. You may delete your account at any time through your account settings.</p>

    <h2>8. Limitation of Liability</h2>
    <p>Agntive.ai is provided "as is" without warranty. Our liability is limited to the amount you paid us in the 12 months preceding any claim.</p>

    <h2>9. Changes to Terms</h2>
    <p>We may update these terms with 30 days' notice. Continued use after changes constitutes acceptance.</p>

    <h2>10. Contact</h2>
    <p>Questions about these terms? Contact <a href="mailto:hello@agntive.ai">hello@agntive.ai</a>.</p>
  </StaticPageLayout>
);

export default TermsOfService;
