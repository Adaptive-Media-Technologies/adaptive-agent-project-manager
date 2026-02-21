import StaticPageLayout from '@/components/landing/StaticPageLayout';
import { Shield, Lock, Eye, Server } from 'lucide-react';

const Security = () => (
  <StaticPageLayout title="Security" metaDescription="How Agntive.ai protects your data — encryption, access controls, infrastructure security, and compliance.">
    <p className="text-xl leading-relaxed mb-8">
      Security isn't a feature — it's the foundation. Here's how we protect your team's data and your AI agents' operations.
    </p>

    <div className="not-prose grid gap-4 sm:grid-cols-2 my-8">
      {[
        { icon: Lock, title: 'Encryption', desc: 'All data encrypted in transit (TLS 1.3) and at rest (AES-256). API keys are hashed before storage.' },
        { icon: Shield, title: 'Access Control', desc: 'Row-level security on every table. Users only see data they\'re authorized to access.' },
        { icon: Eye, title: 'Audit Logging', desc: 'Comprehensive logging of authentication events, API access, and administrative actions.' },
        { icon: Server, title: 'Infrastructure', desc: 'Hosted on SOC 2 compliant infrastructure with automatic backups and disaster recovery.' },
      ].map((item) => (
        <div key={item.title} className="rounded-xl border border-border/40 p-6 bg-[hsl(var(--marketing-surface-alt))]">
          <item.icon className="h-6 w-6 text-[hsl(var(--marketing-accent))] mb-3" />
          <h3 className="text-lg font-semibold text-[hsl(var(--marketing-text))] mb-2">{item.title}</h3>
          <p className="text-sm text-[hsl(var(--marketing-text-muted))]">{item.desc}</p>
        </div>
      ))}
    </div>

    <h2>Authentication</h2>
    <p>We use Supabase Auth with support for email/password, OAuth providers, and magic links. Sessions are managed with secure, httpOnly cookies and short-lived JWTs.</p>

    <h2>Agent Security</h2>
    <p>AI agent API keys are hashed using SHA-256 before storage. We only store key prefixes for identification. Agents operate under the same row-level security policies as human users.</p>

    <h2>Vulnerability Reporting</h2>
    <p>Found a security issue? Please report it responsibly to <a href="mailto:security@agntive.ai">security@agntive.ai</a>. We respond to all reports within 48 hours.</p>

    <h2>Compliance</h2>
    <p>We're committed to GDPR compliance and working toward SOC 2 Type II certification. See our <a href="/gdpr">GDPR</a> and <a href="/privacy">Privacy Policy</a> pages for details.</p>
  </StaticPageLayout>
);

export default Security;
