import { Link } from 'react-router-dom';
import agntfindLogo from '@/assets/agntfind-logo.png';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'AI Agent Tracking', href: '/#features' },
    { label: 'Task Management', href: '/#features' },
    { label: 'Team Chat', href: '/#features' },
    { label: 'Calendar View', href: '/#features' },
    { label: 'API & Automations', href: '/#features' },
    { label: 'Integrations', href: '/#openclaw' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Changelog', href: '/changelog' },
  ],
  'Use Cases': [
    { label: 'AI Agent Management', href: '/#features' },
    { label: 'Team Collaboration', href: '/#features' },
    { label: 'Token Usage Tracking', href: '/#features' },
    { label: 'Project Management', href: '/#features' },
    { label: 'Agentic AI Workflows', href: '/#features' },
    { label: 'Replace Slack + Notion', href: '/replace-slack-notion' },
    { label: 'Small Team Workspace', href: '/small-team-workspace' },
  ],
  Resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'API Reference', href: '/docs' },
    { label: 'Getting Started Guide', href: '/#how-it-works' },
    { label: 'OpenClaw Integration', href: '/#openclaw' },
    { label: 'Blog', href: '/blog' },
    { label: 'Community', href: '/community' },
    { label: 'FAQ', href: '/#faq' },
    { label: 'Status Page', href: '/status' },
  ],
  Company: [
    { label: 'About Agntive', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Press Kit', href: '/press' },
    { label: 'Partners', href: '/partners' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Security', href: '/security' },
    { label: 'Cookie Policy', href: '/cookie-policy' },
    { label: 'GDPR Compliance', href: '/gdpr' },
    { label: 'Data Processing', href: '/data-processing' },
  ],
};

const LandingFooter = () => (
  <footer className="border-t border-border/40 pt-16 pb-10 bg-[hsl(var(--marketing-surface))]">
    <div className="mx-auto max-w-6xl px-6">
      {/* Top section: brand + newsletter */}
      <div className="grid gap-10 md:grid-cols-2 mb-12 pb-10 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src={agntfindLogo} alt="Agntive" className="h-8 w-8 rounded-lg" />
            <span className="text-lg font-bold text-[hsl(var(--marketing-text))]">
              Agntive<span className="text-[hsl(var(--marketing-accent))]">.ai</span>
            </span>
          </div>
          <p className="text-sm text-[hsl(var(--marketing-text-muted))] max-w-md leading-relaxed">
            The task-driven workspace for teams and AI agents. Unify messaging, task tracking, project context, and autonomous AI automation — so small teams stop juggling Slack, Notion, and generic bots.
          </p>
        </div>
        <div className="flex flex-col justify-center md:items-end">
          <h4 className="text-sm font-semibold text-[hsl(var(--marketing-text))] mb-3">Stay in the loop</h4>
          <p className="text-sm text-[hsl(var(--marketing-text-muted))] mb-4 md:text-right max-w-xs">
            Get updates on new features, AI agent integrations, and product tips.
          </p>
          <div className="flex gap-2 w-full max-w-sm">
            <input
              type="email"
              placeholder="you@company.com"
              className="flex-1 rounded-lg border border-border/60 bg-[hsl(var(--marketing-surface))] px-4 py-2 text-sm text-[hsl(var(--marketing-text))] placeholder:text-[hsl(var(--marketing-text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--marketing-accent))/0.3]"
            />
            <button className="rounded-lg bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] to-[hsl(var(--marketing-gradient-end))] px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Link columns */}
      <div className="grid gap-8 grid-cols-2 md:grid-cols-5">
        {Object.entries(footerLinks).map(([category, links]) => (
          <div key={category}>
            <h4 className="text-sm font-semibold text-[hsl(var(--marketing-text))] mb-4">{category}</h4>
            <ul className="space-y-2.5">
              {links.map(link => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-[hsl(var(--marketing-text-muted))] hover:text-[hsl(var(--marketing-text))] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="mt-12 pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[hsl(var(--marketing-text-muted))]">
          © {new Date().getFullYear()} Agntive. All rights reserved.
        </p>
        <p className="text-xs text-[hsl(var(--marketing-text-muted))]">
          <a href="mailto:hello@agntive.ai" className="hover:text-[hsl(var(--marketing-text))] transition-colors">hello@agntive.ai</a>
        </p>
      </div>
    </div>
  </footer>
);

export default LandingFooter;
