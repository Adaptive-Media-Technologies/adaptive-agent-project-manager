import { EyeOff, TrendingUp, Unplug } from 'lucide-react';

const problems = [
  {
    icon: EyeOff,
    title: 'Work scattered across apps',
    description: 'Conversations in Slack, tasks in Notion, notes in Keep. No single source of truth for what your team — or your AI agents — are doing.',
  },
  {
    icon: TrendingUp,
    title: 'AI agents with zero coordination',
    description: 'Your AI agents run tasks in silos. No shared context, no visibility into what they did, and no connection to team workflows.',
  },
  {
    icon: Unplug,
    title: 'Context switching kills momentum',
    description: 'Jumping between five apps to manage one project. Every switch costs focus time your small team can\'t afford.',
  },
];

const ProblemSection = () => (
  <section className="py-20 md:py-28">
    <div className="mx-auto max-w-6xl px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[hsl(var(--marketing-text))]">
          Your team is drowning in{' '}
          <span className="bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] to-[hsl(var(--marketing-gradient-end))] bg-clip-text text-transparent">
            disconnected tools
          </span>
        </h2>
        <p className="mt-4 text-[hsl(var(--marketing-text-muted))] max-w-xl mx-auto">
          Slack for chat, Notion for docs, Google Keep for notes, random bots for AI. Context gets lost, work falls through the cracks.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {problems.map((p, i) => (
          <div
            key={i}
            className="relative rounded-2xl border border-[hsl(var(--destructive))/0.15] bg-[hsl(var(--destructive))/0.03] p-6"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--destructive))/0.1]">
              <p.icon size={22} className="text-[hsl(var(--destructive))]" />
            </div>
            <h3 className="text-base font-semibold text-[hsl(var(--marketing-text))]">{p.title}</h3>
            <p className="mt-2 text-sm text-[hsl(var(--marketing-text-muted))] leading-relaxed">{p.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ProblemSection;
