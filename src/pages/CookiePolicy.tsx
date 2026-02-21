import StaticPageLayout from '@/components/landing/StaticPageLayout';

const CookiePolicy = () => (
  <StaticPageLayout title="Cookie Policy" metaDescription="Agntive.ai Cookie Policy — what cookies we use, why, and how to manage them.">
    <p className="text-sm text-[hsl(var(--marketing-text-muted))]">Last updated: February 1, 2026</p>

    <h2>What Are Cookies?</h2>
    <p>Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and understand how you use the service.</p>

    <h2>Cookies We Use</h2>

    <h3>Essential Cookies</h3>
    <p>Required for the platform to function. These manage your authentication session, remember your theme preference, and ensure security. You cannot disable these.</p>

    <h3>Analytics Cookies</h3>
    <p>Help us understand how visitors interact with the platform so we can improve it. These cookies collect anonymous usage data such as pages visited and features used.</p>

    <h3>Preference Cookies</h3>
    <p>Remember your settings and choices (such as dark mode, sidebar state) to provide a personalized experience across sessions.</p>

    <h2>Third-Party Cookies</h2>
    <p>We do not use third-party advertising cookies. Our analytics provider processes data in accordance with GDPR requirements.</p>

    <h2>Managing Cookies</h2>
    <p>You can control cookies through your browser settings. Note that disabling essential cookies may prevent you from using the platform. Most browsers allow you to:</p>
    <ul>
      <li>View what cookies are stored</li>
      <li>Delete individual or all cookies</li>
      <li>Block cookies from specific or all sites</li>
      <li>Set preferences for first-party vs. third-party cookies</li>
    </ul>

    <h2>Contact</h2>
    <p>Questions about our cookie practices? Contact <a href="mailto:privacy@agntive.ai">privacy@agntive.ai</a>.</p>
  </StaticPageLayout>
);

export default CookiePolicy;
