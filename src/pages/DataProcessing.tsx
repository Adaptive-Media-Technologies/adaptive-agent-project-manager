import StaticPageLayout from '@/components/landing/StaticPageLayout';

const DataProcessing = () => (
  <StaticPageLayout title="Data Processing" metaDescription="Agntive.ai Data Processing Agreement (DPA) — how we handle, store, and protect data on behalf of our customers.">
    <p className="text-sm text-[hsl(var(--marketing-text-muted))]">Last updated: February 1, 2026</p>

    <p className="text-xl leading-relaxed mb-8">
      This page outlines how Agntive.ai processes data on behalf of our customers, in accordance with applicable data protection laws including the GDPR.
    </p>

    <h2>Scope of Processing</h2>
    <p>Agntive.ai processes personal data strictly to provide and maintain the platform services. This includes:</p>
    <ul>
      <li>User account information (name, email, profile data)</li>
      <li>Content created by users (tasks, messages, notes, files)</li>
      <li>Usage metadata (login times, feature usage, device information)</li>
      <li>AI agent configuration and activity logs</li>
    </ul>

    <h2>Sub-Processors</h2>
    <p>We use the following categories of sub-processors:</p>
    <ul>
      <li><strong>Cloud Infrastructure</strong> — For hosting, compute, and data storage</li>
      <li><strong>Database Services</strong> — For managed database operations and backups</li>
      <li><strong>Email Services</strong> — For transactional and notification emails</li>
      <li><strong>Analytics</strong> — For anonymized usage analytics</li>
    </ul>
    <p>All sub-processors are bound by data processing agreements that meet GDPR standards.</p>

    <h2>Data Location</h2>
    <p>Primary data storage is in the United States. Backups may be stored in additional regions for disaster recovery. We use encryption at rest and in transit for all data locations.</p>

    <h2>Data Retention</h2>
    <ul>
      <li><strong>Active accounts:</strong> Data retained for the duration of the subscription</li>
      <li><strong>Deleted accounts:</strong> Personal data purged within 30 days</li>
      <li><strong>Backups:</strong> Rotated and purged within 90 days</li>
      <li><strong>Logs:</strong> Retained for up to 12 months for security purposes</li>
    </ul>

    <h2>Data Processing Agreement</h2>
    <p>Enterprise customers requiring a signed DPA can request one at <a href="mailto:legal@agntive.ai">legal@agntive.ai</a>. We provide our standard DPA at no additional cost.</p>

    <h2>Contact</h2>
    <p>For questions about our data processing practices, contact <a href="mailto:privacy@agntive.ai">privacy@agntive.ai</a>.</p>
  </StaticPageLayout>
);

export default DataProcessing;
