import { EyeOff, TrendingUp, Unplug } from 'lucide-react';

const problems = [
  {
    icon: EyeOff,
    title: 'No visibility into agent activity',
    description: 'Your AI agents complete tasks, but you have no idea what they did, how long it took, or what it cost.',
  },
  {
    icon: TrendingUp,
    title: 'Token costs spiraling without tracking',
    description: 'Every API call burns tokens. Without tracking, costs creep up silently until the bill arrives.',
  },
  {
    icon: Unplug,
    title: 'No way to coordinate humans + agents',
    description: 'Humans and AI agents work in silos. Tasks fall through the cracks with no shared workspace.',
  },
];

const ProblemSection = () => (
  <section className="py-20 md:py-28">
    <div className="mx-auto max-w-6xl px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[hsl(var(--marketing-text))]">
          Your AI agents are working{' '}
          <span className="bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] to-[hsl(var(--marketing-gradient-end))] bg-clip-text text-transparent">
            in the dark
          </span>
        </h2>
        <p className="mt-4 text-[hsl(var(--marketing-text-muted))] max-w-xl mx-auto">
          Most teams have zero visibility into their AI agents. Sound familiar?
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
