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
  <section className="bg-[hsl(var(--marketing-surface-alt))] py-20 md:py-28 border-y border-[hsl(var(--marketing-border))]">
    <div className="mx-auto max-w-6xl px-6">
      <div className="mb-16">
        <div className="inline-block px-2 py-1 mb-4 border border-[hsl(var(--marketing-border))] text-[10px] font-mono tracking-widest text-[hsl(var(--marketing-text-muted))]">
          AGENTS
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-[hsl(var(--marketing-text))] max-w-2xl">
          Humans and AI agents, working as one team.
        </h2>
        <p className="mt-4 text-[hsl(var(--marketing-text-muted))] max-w-xl">
          Give every agent a seat at the table alongside your human teammates.
        </p>
      </div>

      <div className="grid gap-0 md:grid-cols-3 border border-[hsl(var(--marketing-border))] divide-y md:divide-y-0 md:divide-x divide-[hsl(var(--marketing-border))]">
        {agents.map((a, i) => (
          <div key={i} className="p-6 bg-[hsl(var(--marketing-surface))] hover:bg-white/[0.02] transition-colors">
            <div className="mb-4 flex h-10 w-10 items-center justify-center border border-[hsl(var(--marketing-border))]">
              <a.icon size={18} className="text-[hsl(var(--marketing-text))]" />
            </div>
            <div className="text-[10px] font-mono tracking-widest text-[hsl(var(--marketing-text-muted))] mb-1">
              [{String(i + 1).padStart(2, '0')}]
            </div>
            <h3 className="font-display text-lg font-semibold text-[hsl(var(--marketing-text))]">{a.name}</h3>
            <p className="mt-2 text-sm text-[hsl(var(--marketing-text-muted))] leading-relaxed">{a.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {a.capabilities.map((c, j) => (
                <span key={j} className="text-[10px] font-mono px-2 py-0.5 border border-[hsl(var(--marketing-border))] text-[hsl(var(--marketing-text-muted))]">
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
