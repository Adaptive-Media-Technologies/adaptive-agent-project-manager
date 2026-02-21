const testimonials = [
  {
    quote: "We replaced Slack, Notion, and two other tools with Agntive. One workspace for the whole team — humans and AI agents alike.",
    name: 'Sarah Chen',
    role: 'CTO, NeuralForge',
  },
  {
    quote: "We cut our token spend by 40% in the first month just by having visibility. The unified workspace paid for itself immediately.",
    name: 'Marcus Williams',
    role: 'Engineering Lead, SynthLabs',
  },
  {
    quote: "Our agents pick up tasks, report progress, and the whole team can see it in context. No more juggling five different apps.",
    name: 'Priya Patel',
    role: 'Founder, AgentStack',
  },
  {
    quote: "Before Agntive, coordinating humans and AI agents was chaos across scattered tools. Now it's our competitive advantage.",
    name: 'James Rodriguez',
    role: 'VP Engineering, CortexAI',
  },
];

const Testimonials = () => (
  <section className="bg-[hsl(var(--marketing-surface-alt))] py-20 md:py-28">
    <div className="mx-auto max-w-6xl px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[hsl(var(--marketing-text))]">
          Teams building with Agntive
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {testimonials.map((t, i) => (
          <div key={i} className="rounded-2xl border border-border/60 bg-[hsl(var(--marketing-surface))] p-6">
            <p className="text-[hsl(var(--marketing-text))] leading-relaxed italic">"{t.quote}"</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[hsl(var(--marketing-gradient-start))] to-[hsl(var(--marketing-gradient-end))] flex items-center justify-center text-white font-bold text-sm">
                {t.name[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--marketing-text))]">{t.name}</p>
                <p className="text-xs text-[hsl(var(--marketing-text-muted))]">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
