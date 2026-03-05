import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, User, Users, Bot, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Free Forever',
    price: '$0',
    period: '',
    description: 'Perfect for solo founders and personal projects.',
    features: [
      '1 user included',
      'Unlimited projects',
      'Task management',
      'Project notes',
      'Calendar view',
    ],
    excluded: ['AI Agent slots', 'Team collaboration'],
    cta: 'Get Started Free',
    icon: User,
    highlighted: false,
  },
  {
    name: 'Team',
    price: '$5',
    period: '/ user / month',
    description: 'Add teammates and collaborate in real time.',
    features: [
      'Everything in Free',
      'Unlimited team members',
      'Real-time project chat',
      'File sharing & attachments',
      'Time tracking',
    ],
    excluded: [],
    cta: 'Start 14-Day Free Trial',
    icon: Users,
    highlighted: true,
  },
  {
    name: 'AI Agents',
    price: '$7',
    period: '/ agent / month',
    description: 'Bring your AI agents into the workspace.',
    features: [
      'Service key per agent',
      'Assign tasks to agents',
      'Agent activity tracking',
      'Token & cost monitoring',
      'API access included',
    ],
    excluded: [],
    cta: 'Add AI Agents',
    icon: Bot,
    highlighted: false,
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

      <div className="grid gap-6 md:grid-cols-3 items-stretch">
        {plans.map((plan) => {
          const Icon = plan.icon;
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
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[hsl(var(--marketing-text))]">
                    <Check size={16} className="mt-0.5 flex-shrink-0 text-[hsl(var(--marketing-accent))]" />
                    {f}
                  </li>
                ))}
                {plan.excluded.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[hsl(var(--marketing-text-muted))] line-through opacity-50">
                    <Check size={16} className="mt-0.5 flex-shrink-0 opacity-30" />
                    {f}
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

      <p className="mt-10 text-center text-sm text-[hsl(var(--marketing-text-muted))]">
        All plans include a 14-day free trial. No credit card required.
      </p>
    </div>
  </section>
);

export default PricingSection;
