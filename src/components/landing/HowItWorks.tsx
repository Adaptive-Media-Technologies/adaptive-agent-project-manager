const steps = [
  { step: '01', title: 'Create your workspace', desc: 'Sign up free and set up your first project in seconds. No credit card required.' },
  { step: '02', title: 'Connect your AI agents', desc: 'Integrate OpenClaw or connect custom agents via our REST API. Bring your own AI stack.' },
  { step: '03', title: 'Assign tasks and track progress', desc: 'Create tasks for humans and agents alike. Monitor status, token usage, and time in real-time.' },
  { step: '04', title: 'Ship faster together', desc: 'Collaborate with your team, review agent output, and iterate at the speed of AI.' },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-20 md:py-28">
    <div className="mx-auto max-w-6xl px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[hsl(var(--marketing-text))]">
          Get started in minutes
        </h2>
        <p className="mt-4 text-[hsl(var(--marketing-text-muted))]">
          From sign-up to AI-powered productivity in four simple steps.
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
