import { Code2, Search, ShieldCheck } from 'lucide-react';

const agents = [
  {
    icon: Code2,
    name: 'Code Agent',
    description: 'Automatically creates pull requests, updates task status on merge, and logs time spent on each coding task.',
    capabilities: ['Auto-create PRs', 'Update task status', 'Log time & tokens'],
  },
  {
    icon: Search,
    name: 'Research Agent',
    description: 'Gathers data from multiple sources, summarizes findings, and attaches research notes directly to tasks.',
    capabilities: ['Web research', 'Summarize findings', 'Attach to tasks'],
  },
  {
    icon: ShieldCheck,
    name: 'Ops Agent',
    description: 'Monitors deployments, creates incident tasks when issues arise, and notifies the right team members instantly.',
    capabilities: ['Monitor deploys', 'Create incidents', 'Auto-notify team'],
  },
];

const AgentDeepDive = () => (
  <section className="bg-[hsl(var(--marketing-surface-alt))] py-20 md:py-28">
    <div className="mx-auto max-w-6xl px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[hsl(var(--marketing-text))]">
          A new era of human + agent{' '}
          <span className="bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] to-[hsl(var(--marketing-gradient-end))] bg-clip-text text-transparent">
            collaboration
          </span>
        </h2>
        <p className="mt-4 text-[hsl(var(--marketing-text-muted))] max-w-xl mx-auto">
          Different agents, different superpowers. Agntive gives each one a seat at the table.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {agents.map((a, i) => (
          <div key={i} className="rounded-2xl border border-border/60 bg-[hsl(var(--marketing-surface))] p-6 hover:shadow-lg hover:shadow-[hsl(var(--marketing-accent))/0.06] transition-all">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--marketing-gradient-start))/0.1] to-[hsl(var(--marketing-gradient-end))/0.1]">
              <a.icon size={24} className="text-[hsl(var(--marketing-accent))]" />
            </div>
            <h3 className="text-lg font-semibold text-[hsl(var(--marketing-text))]">{a.name}</h3>
            <p className="mt-2 text-sm text-[hsl(var(--marketing-text-muted))] leading-relaxed">{a.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {a.capabilities.map((c, j) => (
                <span key={j} className="text-xs font-medium px-2.5 py-1 rounded-full bg-[hsl(var(--marketing-accent))/0.08] text-[hsl(var(--marketing-accent))]">
                  {c}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AgentDeepDive;
