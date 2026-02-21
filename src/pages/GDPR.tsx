import StaticPageLayout from '@/components/landing/StaticPageLayout';

const GDPR = () => (
  <StaticPageLayout title="GDPR Compliance" metaDescription="How Agntive.ai complies with the General Data Protection Regulation (GDPR) — your rights, our practices.">
    <p className="text-sm text-[hsl(var(--marketing-text-muted))]">Last updated: February 1, 2026</p>

    <p className="text-xl leading-relaxed mb-8">
      Agntive.ai is committed to protecting the privacy and rights of individuals in the European Economic Area (EEA) under the General Data Protection Regulation (GDPR).
    </p>

    <h2>Your Rights Under GDPR</h2>
    <ul>
      <li><strong>Right of Access</strong> — Request a copy of all personal data we hold about you.</li>
      <li><strong>Right to Rectification</strong> — Correct inaccurate personal data.</li>
      <li><strong>Right to Erasure</strong> — Request deletion of your personal data ("right to be forgotten").</li>
      <li><strong>Right to Data Portability</strong> — Receive your data in a structured, machine-readable format.</li>
      <li><strong>Right to Restrict Processing</strong> — Limit how we process your data in certain circumstances.</li>
      <li><strong>Right to Object</strong> — Object to processing based on legitimate interests or direct marketing.</li>
    </ul>

    <h2>Legal Basis for Processing</h2>
    <p>We process personal data under the following legal bases:</p>
    <ul>
      <li><strong>Contract</strong> — To provide the services you've signed up for.</li>
      <li><strong>Legitimate Interest</strong> — To improve our platform, prevent fraud, and ensure security.</li>
      <li><strong>Consent</strong> — For optional communications like newsletters (which you can withdraw anytime).</li>
    </ul>

    <h2>Data Processing</h2>
    <p>Our primary data processors include our hosting provider (for infrastructure), our email provider (for transactional emails), and our analytics provider. All processors are bound by data processing agreements compliant with GDPR requirements.</p>

    <h2>International Transfers</h2>
    <p>Data may be transferred to and processed in the United States. We use Standard Contractual Clauses (SCCs) approved by the European Commission to ensure adequate protection.</p>

    <h2>Data Protection Officer</h2>
    <p>For GDPR-related inquiries or to exercise your rights, contact our Data Protection Officer at <a href="mailto:dpo@agntive.ai">dpo@agntive.ai</a>.</p>

    <h2>Supervisory Authority</h2>
    <p>You have the right to lodge a complaint with your local data protection authority if you believe your rights have been violated.</p>
  </StaticPageLayout>
);

export default GDPR;
