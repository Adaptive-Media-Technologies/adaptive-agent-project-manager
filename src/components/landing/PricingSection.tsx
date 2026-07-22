import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, User, Users, Bot, ArrowRight, FolderKanban, MessageSquare, StickyNote, ListChecks, Timer, CalendarDays, BarChart3, Paperclip, Archive } from 'lucide-react';

const freeFeatures = [
  { name: 'Create & manage projects', icon: FolderKanban },
  { name: 'Task boards with drag & drop', icon: ListChecks },
  { name: 'Project notes (Google Keep style)', icon: StickyNote },
  { name: 'Calendar view & due dates', icon: CalendarDays },
  { name: 'Task progress & completion tracking', icon: BarChart3 },
  { name: 'File attachments on tasks', icon: Paperclip },
  { name: 'Archive & restore projects', icon: Archive },
  { name: 'Time tracking & stopwatch', icon: Timer },
  { name: 'Real-time project chat', icon: MessageSquare },
];

const addOnItems = [
  { name: '$5 per month for additional users', icon: Users },
  { name: '$7 per month for AI Agents', icon: Bot },
];

const PricingSection = () => (
  <section id="pricing" className="py-20 md:py-28">
    <div className="mx-auto max-w-6xl px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[hsl(var(--marketing-text))]">
          Simple, transparent pricing
        </h2>
        <p className="mt-4 text-[hsl(var(--marketing-text-muted))] max-w-lg mx-auto">
          Free forever for 1 user. Add additional users for $5/mo and AI agents for $7/mo.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-6 md:grid-cols-2 items-stretch mb-16">
        <div className="relative flex flex-col border border-[hsl(var(--marketing-accent))] bg-[hsl(var(--marketing-surface-raised))] p-8 shadow-[0_0_0_1px_hsl(var(--marketing-accent)/0.3),0_20px_60px_-20px_hsl(var(--marketing-accent)/0.35),inset_0_1px_0_hsl(0_0%_100%/0.04)]">
          <div className="absolute -top-3 left-6 bg-[hsl(var(--marketing-accent))] text-[hsl(var(--marketing-accent-foreground))] px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest">
            RECOMMENDED
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center border border-[hsl(var(--marketing-border-strong))] bg-[hsl(var(--marketing-surface))]">
                <User size={18} className="text-[hsl(var(--marketing-accent))]" />
              </div>
              <h3 className="font-display text-lg font-semibold text-[hsl(var(--marketing-text))]">Free Forever</h3>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-5xl font-bold text-[hsl(var(--marketing-text))] tabular-nums">$0</span>
              <span className="text-sm font-mono text-[hsl(var(--marketing-warning))] ml-1">/ forever</span>
            </div>
            <p className="mt-2 text-sm text-[hsl(var(--marketing-text-muted))]">
              Perfect for solo founders and personal projects. 1 user for free.
            </p>
          </div>

          <ul className="mb-8 flex-1 space-y-3">
            {freeFeatures.map((f) => (
              <li key={f.name} className="flex items-start gap-2.5 text-sm text-[hsl(var(--marketing-text))]">
                <Check size={16} className="mt-0.5 flex-shrink-0 text-[hsl(var(--marketing-accent))]" />
                {f.name}
              </li>
            ))}
          </ul>

          <Link to="/auth" className="mt-auto">
            <Button
              className="w-full rounded-sm font-bold tracking-wide bg-[hsl(var(--marketing-accent))] text-[hsl(var(--marketing-accent-foreground))] hover:brightness-110 border-0"
              size="lg"
            >
              GET STARTED FREE <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        <div className="relative flex flex-col border border-[hsl(var(--marketing-border))] bg-[hsl(var(--marketing-surface-raised))] p-8 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.04)]">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center border border-[hsl(var(--marketing-border-strong))] bg-[hsl(var(--marketing-surface))]">
                <Users size={18} className="text-[hsl(var(--marketing-warning))]" />
              </div>
              <h3 className="font-display text-lg font-semibold text-[hsl(var(--marketing-text))]">Add-ons</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-5xl font-bold text-[hsl(var(--marketing-text))] tabular-nums">$5</span>
              <span className="text-sm font-mono text-[hsl(var(--marketing-warning))]">/ user / mo</span>
            </div>
            <p className="mt-2 text-sm text-[hsl(var(--marketing-text-muted))]">
              Add teammates and AI agents when you're ready.
            </p>
          </div>

          <ul className="mb-8 flex-1 space-y-3">
            {addOnItems.map((f) => (
              <li key={f.name} className="flex items-start gap-2.5 text-sm text-[hsl(var(--marketing-text))]">
                <Check size={16} className="mt-0.5 flex-shrink-0 text-[hsl(var(--marketing-warning))]" />
                {f.name}
              </li>
            ))}
          </ul>

          <Link to="/auth" className="mt-auto">
            <Button
              className="w-full rounded-sm font-bold tracking-wide bg-[hsl(var(--marketing-surface))] border border-[hsl(var(--marketing-border-strong))] text-[hsl(var(--marketing-text))] hover:border-[hsl(var(--marketing-text-muted))]"
              variant="outline"
              size="lg"
            >
              START FREE <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>

      <p className="mt-10 text-center text-sm text-[hsl(var(--marketing-text-muted))]">
        No credit card required.
      </p>
    </div>
  </section>
);

export default PricingSection;
