const steps = [
  { step: '01', title: 'Create your workspace', desc: 'Sign up and invite your team. Your workspace is ready in seconds.' },
  { step: '02', title: 'Bring your tools together', desc: 'Connect AI agents via API, set up project boards, and start conversations — all in one place.' },
  { step: '03', title: 'Assign work to humans and agents', desc: 'Create tasks, assign them to team members or AI agents, and track progress in real-time.' },
  { step: '04', title: 'Ship faster, together', desc: 'Chat, track, and automate in context. No more app-switching, no more lost threads.' },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-20 md:py-28">
    <div className="mx-auto max-w-6xl px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[hsl(var(--marketing-text))]">
          Up and running in minutes
        </h2>
        <p className="mt-4 text-[hsl(var(--marketing-text-muted))]">
          Four steps from sign-up to a fully coordinated team + AI workspace.
        </p>
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* Vertical line */}
        <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[hsl(var(--marketing-gradient-start))] via-[hsl(var(--marketing-gradient-mid))] to-[hsl(var(--marketing-gradient-end))] hidden md:block" />

        <div className="space-y-10">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-6 items-start">
              <div className="flex-shrink-0 relative z-10 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(var(--marketing-gradient-start))] to-[hsl(var(--marketing-gradient-end))] text-white font-extrabold text-lg shadow-lg shadow-[hsl(var(--marketing-accent))/0.2]">
                {s.step}
              </div>
              <div className="pt-1 md:pt-3">
                <h3 className="text-lg font-semibold text-[hsl(var(--marketing-text))]">{s.title}</h3>
                <p className="mt-1 text-sm text-[hsl(var(--marketing-text-muted))] leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorks;
