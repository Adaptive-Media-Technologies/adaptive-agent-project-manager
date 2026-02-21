import StaticPageLayout from '@/components/landing/StaticPageLayout';
import { Button } from '@/components/ui/button';
import { MessageSquare, Github, Twitter, BookOpen } from 'lucide-react';

const channels = [
  { icon: MessageSquare, name: 'Discord', description: 'Join our community server to chat with other users, share workflows, and get help from the team.', cta: 'Join Discord', href: '#' },
  { icon: Github, name: 'GitHub', description: 'Explore our open-source projects, report bugs, request features, and contribute to the platform.', cta: 'View GitHub', href: '#' },
  { icon: Twitter, name: 'Twitter / X', description: 'Follow us for product updates, AI agent insights, and behind-the-scenes looks at what we\'re building.', cta: 'Follow Us', href: '#' },
  { icon: BookOpen, name: 'Blog', description: 'Deep dives on AI agents, AEO strategies, and how to build AI-native teams.', cta: 'Read Blog', href: '/blog' },
];

const Community = () => (
  <StaticPageLayout title="Community" metaDescription="Join the Agntive.ai community — connect with AI-native teams on Discord, GitHub, and Twitter.">
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
