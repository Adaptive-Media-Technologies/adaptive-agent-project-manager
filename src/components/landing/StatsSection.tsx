const stats = [
  { value: '1', label: 'workspace instead of five apps' },
  { value: '10x', label: 'faster coordination between humans and AI' },
  { value: '100%', label: 'visibility across all team and agent activity' },
];

const StatsSection = () => (
  <section className="py-20 md:py-28">
    <div className="mx-auto max-w-6xl px-6">
      <div className="grid gap-8 md:grid-cols-3 text-center">
        {stats.map((s, i) => (
          <div key={i}>
            <p className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] via-[hsl(var(--marketing-gradient-mid))] to-[hsl(var(--marketing-gradient-end))] bg-clip-text text-transparent">
              {s.value}
            </p>
            <p className="mt-3 text-[hsl(var(--marketing-text-muted))] text-sm md:text-base">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
