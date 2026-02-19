const logos = [
  'NeuralForge', 'AgentStack', 'SynthLabs', 'CortexAI', 'PromptOps',
  'VectorFlow', 'DeepShip', 'ModelOps',
];

const LogoBar = () => (
  <section className="border-y border-border/40 py-10 bg-[hsl(var(--marketing-surface))]">
    <div className="mx-auto max-w-6xl px-6">
      <p className="text-center text-sm font-medium text-[hsl(var(--marketing-text-muted))] mb-8 uppercase tracking-widest">
        Trusted by AI-first teams
      </p>
      <div className="overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[hsl(var(--marketing-surface))] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[hsl(var(--marketing-surface))] to-transparent z-10" />
        <div className="flex animate-marquee gap-12 items-center">
          {[...logos, ...logos].map((name, i) => (
            <div
              key={i}
              className="flex-shrink-0 text-lg font-bold text-[hsl(var(--marketing-text-muted))/0.3] tracking-tight whitespace-nowrap select-none"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default LogoBar;
