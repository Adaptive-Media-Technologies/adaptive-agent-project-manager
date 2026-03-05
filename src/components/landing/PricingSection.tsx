import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, User, Users, Bot, ArrowRight, X, FolderKanban, MessageSquare, StickyNote, ListChecks, Timer, CalendarDays, BarChart3, Paperclip, Archive, Key } from 'lucide-react';

const allFeatures = [
  { name: 'Create & manage projects', icon: FolderKanban, free: true, team: true, agent: true },
  { name: 'Task boards with drag & drop', icon: ListChecks, free: true, team: true, agent: true },
  { name: 'Assign tasks to users', icon: User, free: true, team: true, agent: true },
  { name: 'Project notes (Google Keep style)', icon: StickyNote, free: true, team: true, agent: true },
  { name: 'Calendar view & due dates', icon: CalendarDays, free: true, team: true, agent: true },
  { name: 'Task progress & completion tracking', icon: BarChart3, free: true, team: true, agent: true },
  { name: 'File attachments on tasks', icon: Paperclip, free: true, team: true, agent: true },
  { name: 'Archive & restore projects', icon: Archive, free: true, team: true, agent: true },
  { name: 'Time tracking & stopwatch', icon: Timer, free: true, team: true, agent: true },
  { name: 'Team collaboration & invites', icon: Users, free: false, team: true, agent: true },
  { name: 'Real-time project chat', icon: MessageSquare, free: false, team: true, agent: true },
  { name: 'Assign tasks to AI Agents', icon: Bot, free: false, team: false, agent: true },
  { name: 'Agent service keys & API access', icon: Key, free: false, team: false, agent: true },
  { name: 'Agent activity & cost monitoring', icon: BarChart3, free: false, team: false, agent: true },
];

const plans = [
  {
    name: 'Free Forever',
    price: '$0',
    period: '',
    description: 'Perfect for solo founders and personal projects.',
    cta: 'Get Started Free',
    icon: User,
    highlighted: false,
    columnKey: 'free' as const,
  },
  {
    name: 'Team',
    price: '$5',
    period: '/ user / month',
    description: 'Add teammates and collaborate in real time.',
    cta: 'Start 14-Day Free Trial',
    icon: Users,
    highlighted: true,
    columnKey: 'team' as const,
  },
  {
    name: 'AI Agents',
    price: '$7',
    period: '/ agent / month',
    description: 'Bring your AI agents into the workspace.',
    cta: 'Add AI Agents',
    icon: Bot,
    highlighted: false,
    columnKey: 'agent' as const,
  },
];

const PricingSection = () => (
  <section id="pricing" className="py-20 md:py-28">
    <div className="mx-auto max-w-6xl px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[hsl(var(--marketing-text))]">
          Simple, transparent pricing
        </h2>
        <p className="mt-4 text-[hsl(var(--marketing-text-muted))] max-w-lg mx-auto">
          Start free. Add teammates for $5/mo each. Bring AI agents for $7/mo each. No surprises.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-6 md:grid-cols-3 items-stretch mb-16">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const includedFeatures = allFeatures.filter(f => f[plan.columnKey]);
          const excludedFeatures = allFeatures.filter(f => !f[plan.columnKey]);
          return (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all ${
                plan.highlighted
                  ? 'border-[hsl(var(--marketing-accent))] bg-[hsl(var(--marketing-surface))] shadow-xl shadow-[hsl(var(--marketing-accent))/0.1] scale-[1.02]'
                  : 'border-border/40 bg-[hsl(var(--marketing-surface))]'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] via-[hsl(var(--marketing-gradient-mid))] to-[hsl(var(--marketing-gradient-end))] px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    plan.highlighted
                      ? 'bg-gradient-to-br from-[hsl(var(--marketing-gradient-start))] to-[hsl(var(--marketing-gradient-end))] text-white'
                      : 'bg-[hsl(var(--marketing-surface-alt))] text-[hsl(var(--marketing-text-muted))]'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-[hsl(var(--marketing-text))]">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[hsl(var(--marketing-text))]">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-[hsl(var(--marketing-text-muted))]">{plan.period}</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-[hsl(var(--marketing-text-muted))]">{plan.description}</p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {includedFeatures.map((f) => (
                  <li key={f.name} className="flex items-start gap-2.5 text-sm text-[hsl(var(--marketing-text))]">
                    <Check size={16} className="mt-0.5 flex-shrink-0 text-[hsl(var(--marketing-accent))]" />
                    {f.name}
                  </li>
                ))}
                {excludedFeatures.map((f) => (
                  <li key={f.name} className="flex items-start gap-2.5 text-sm text-[hsl(var(--marketing-text-muted))] opacity-40">
                    <X size={16} className="mt-0.5 flex-shrink-0" />
                    <span className="line-through">{f.name}</span>
                  </li>
                ))}
              </ul>

              <Link to="/auth" className="mt-auto">
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] via-[hsl(var(--marketing-gradient-mid))] to-[hsl(var(--marketing-gradient-end))] text-white border-0 shadow-lg shadow-[hsl(var(--marketing-accent))/0.25]'
                      : ''
                  }`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                  size="lg"
                >
                  {plan.cta} <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table (desktop) */}
      <div className="hidden md:block rounded-2xl border border-border/40 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-[hsl(var(--marketing-surface-alt))]">
              <th className="text-left p-4 text-[hsl(var(--marketing-text))] font-semibold">Feature</th>
              {plans.map(p => (
                <th key={p.name} className="text-center p-4 text-[hsl(var(--marketing-text))] font-semibold w-40">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allFeatures.map((f, i) => {
              const FeatureIcon = f.icon;
              return (
                <tr key={f.name} className={i < allFeatures.length - 1 ? 'border-b border-border/20' : ''}>
                  <td className="p-4 text-[hsl(var(--marketing-text))]">
                    <span className="flex items-center gap-2.5">
                      <FeatureIcon size={16} className="text-[hsl(var(--marketing-text-muted))] flex-shrink-0" />
                      {f.name}
                    </span>
                  </td>
                  {plans.map(p => (
                    <td key={p.name} className="text-center p-4">
                      {f[p.columnKey] ? (
                        <Check size={18} className="mx-auto text-[hsl(var(--marketing-accent))]" />
                      ) : (
                        <X size={18} className="mx-auto text-[hsl(var(--marketing-text-muted))] opacity-30" />
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-10 text-center text-sm text-[hsl(var(--marketing-text-muted))]">
        All plans include a 14-day free trial. No credit card required.
      </p>
    </div>
  </section>
);

export default PricingSection;
