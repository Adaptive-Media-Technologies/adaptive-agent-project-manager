import StaticPageLayout from '@/components/landing/StaticPageLayout';

const entries = [
  {
    date: 'February 2026',
    title: 'Blog & Content Hub Launch',
    items: ['20 SEO-optimized articles on AI agents, AEO, and team workflows', 'Tag-based filtering and rich cover images', 'JSON-LD structured data for search visibility'],
  },
  {
    date: 'January 2026',
    title: 'OpenClaw Integration v2',
    items: ['Bi-directional agent status sync', 'Token usage tracking per task and project', 'Webhook support for agent lifecycle events'],
  },
  {
    date: 'December 2025',
    title: 'Team Collaboration Overhaul',
    items: ['Real-time project chat with file attachments', 'Team invitations via email', 'Unified notification center'],
  },
  {
    date: 'November 2025',
    title: 'Calendar & Time Tracking',
    items: ['Interactive calendar view for tasks and deadlines', 'Built-in stopwatch and manual time logging', 'Time reports per project and team member'],
  },
  {
    date: 'October 2025',
    title: 'Core Platform Launch',
    items: ['Project and task management with drag-and-drop', 'Agent registration and API key management', 'Dark mode and responsive design'],
  },
];

const Changelog = () => (
  <StaticPageLayout title="Changelog" metaDescription="See what's new in Agntive.ai — recent updates, new features, and improvements to the AI-native workspace.">
    <p className="text-xl leading-relaxed mb-8">
      We ship fast. Here's what's been happening at Agntive.
    </p>

    <div className="not-prose space-y-8 my-6">
      {entries.map((entry) => (
        <div key={entry.date} className="relative pl-6 border-l-2 border-[hsl(var(--marketing-accent))/0.3]">
          <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-[hsl(var(--marketing-accent))]" />
          <p className="text-sm font-medium text-[hsl(var(--marketing-accent))] mb-1">{entry.date}</p>
          <h3 className="text-lg font-semibold text-[hsl(var(--marketing-text))] mb-3">{entry.title}</h3>
          <ul className="space-y-1.5">
            {entry.items.map((item) => (
              <li key={item} className="text-sm text-[hsl(var(--marketing-text-muted))] flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[hsl(var(--marketing-text-muted))/0.5] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </StaticPageLayout>
);

export default Changelog;
