import StaticPageLayout from '@/components/landing/StaticPageLayout';
import { Button } from '@/components/ui/button';
import { BookOpen, Mail } from 'lucide-react';

const channels = [
  { icon: BookOpen, name: 'Blog', description: 'Deep dives on AI agents, AEO strategies, and how to build AI-native teams.', cta: 'Read Blog', href: '/blog' },
  { icon: Mail, name: 'Contact Us', description: 'Have questions or want to collaborate? Reach out to our team directly.', cta: 'Email Us', href: 'mailto:hello@agntive.ai' },
];

const Community = () => (
  <StaticPageLayout title="Community" metaDescription="Join the Agntive.ai community — connect with AI-native teams building with AI agents.">
    <p className="text-xl leading-relaxed mb-8">
      Agntive is built with and for its community. Connect with other teams deploying AI agents, share workflows, and help shape the product.
    </p>

    <div className="not-prose grid gap-4 sm:grid-cols-2 my-8">
      {channels.map((ch) => (
        <div key={ch.name} className="rounded-xl border border-border/40 p-6 bg-[hsl(var(--marketing-surface-alt))]">
          <ch.icon className="h-6 w-6 text-[hsl(var(--marketing-accent))] mb-3" />
          <h3 className="text-lg font-semibold text-[hsl(var(--marketing-text))] mb-2">{ch.name}</h3>
          <p className="text-sm text-[hsl(var(--marketing-text-muted))] mb-4">{ch.description}</p>
          <Button size="sm" variant="outline" asChild>
            <a href={ch.href}>{ch.cta}</a>
          </Button>
        </div>
      ))}
    </div>

    <h2>Community Guidelines</h2>
    <p>
      We're committed to maintaining a welcoming, inclusive community. Be respectful, share knowledge generously, and help each other build amazing things with AI agents.
    </p>
  </StaticPageLayout>
);

export default Community;
