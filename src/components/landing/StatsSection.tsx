const stats = [
  { value: '1', label: 'workspace instead of five apps' },
  { value: '10x', label: 'faster coordination between humans and AI' },
  { value: '100%', label: 'visibility across all team and agent activity' },
];

const StatsSection = () => (
  <section className="py-20 md:py-28 border-y border-[hsl(var(--marketing-border))]">
    <div className="mx-auto max-w-6xl px-6">
      <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[hsl(var(--marketing-border))]">
        {stats.map((s, i) => (
          <div key={i} className="px-6 py-8 text-center md:text-left">
            <p className="font-display text-5xl md:text-6xl font-bold tracking-tight text-[hsl(var(--marketing-text))] tabular-nums">
              {s.value}
            </p>
            <p className="mt-3 text-[hsl(var(--marketing-text-muted))] text-sm">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
