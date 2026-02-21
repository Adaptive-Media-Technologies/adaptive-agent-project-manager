import StaticPageLayout from '@/components/landing/StaticPageLayout';

const PrivacyPolicy = () => (
  <StaticPageLayout title="Privacy Policy" metaDescription="Agntive.ai Privacy Policy — how we collect, use, and protect your personal data.">
    <p className="text-sm text-[hsl(var(--marketing-text-muted))]">Last updated: February 1, 2026</p>

    <h2>1. Information We Collect</h2>
    <p>We collect information you provide directly: name, email address, and any data you enter into the platform (tasks, messages, notes). We also collect usage data such as page views, feature usage, and device information through analytics.</p>

    <h2>2. How We Use Your Information</h2>
    <ul>
      <li>To provide, maintain, and improve the Agntive.ai platform</li>
      <li>To communicate with you about your account and product updates</li>
      <li>To provide customer support</li>
      <li>To detect and prevent fraud or abuse</li>
      <li>To comply with legal obligations</li>
    </ul>

    <h2>3. Data Sharing</h2>
    <p>We do not sell your personal data. We may share data with service providers who help us operate the platform (hosting, analytics, email delivery), and when required by law.</p>

    <h2>4. Data Retention</h2>
    <p>We retain your data for as long as your account is active. When you delete your account, we remove your personal data within 30 days, except where retention is required by law.</p>

    <h2>5. Security</h2>
    <p>We use industry-standard encryption, access controls, and monitoring to protect your data. All data is encrypted in transit (TLS) and at rest.</p>

    <h2>6. Your Rights</h2>
    <p>You have the right to access, correct, delete, or export your personal data at any time. Contact us at <a href="mailto:privacy@agntive.ai">privacy@agntive.ai</a> to exercise these rights.</p>

    <h2>7. Cookies</h2>
    <p>We use essential cookies to maintain your session and preferences. See our <a href="/cookie-policy">Cookie Policy</a> for details.</p>

    <h2>8. Changes to This Policy</h2>
    <p>We may update this policy from time to time. We'll notify you of significant changes via email or in-app notification.</p>

    <h2>9. Contact</h2>
    <p>For privacy-related questions, contact <a href="mailto:privacy@agntive.ai">privacy@agntive.ai</a>.</p>
  </StaticPageLayout>
);

export default PrivacyPolicy;
