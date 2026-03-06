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
        <div className="relative flex flex-col rounded-2xl border p-8 transition-all border-[hsl(var(--marketing-accent))] bg-[hsl(var(--marketing-surface))] shadow-xl shadow-[hsl(var(--marketing-accent))/0.1] scale-[1.01]">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] via-[hsl(var(--marketing-gradient-mid))] to-[hsl(var(--marketing-gradient-end))] px-4 py-1 text-xs font-semibold text-white">
            Selected
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--marketing-gradient-start))] to-[hsl(var(--marketing-gradient-end))] text-white">
                <User size={20} />
              </div>
              <h3 className="text-lg font-semibold text-[hsl(var(--marketing-text))]">Free Forever</h3>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-[hsl(var(--marketing-text))]">$0</span>
            </div>
            <p className="mt-2 text-sm text-[hsl(var(--marketing-text-muted))]">
              Perfect for solo founders and personal projects. 1 User for Free.
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
              className="w-full bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] via-[hsl(var(--marketing-gradient-mid))] to-[hsl(var(--marketing-gradient-end))] text-white border-0 shadow-lg shadow-[hsl(var(--marketing-accent))/0.25]"
              variant="default"
              size="lg"
            >
              Get Started Free <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        <div className="relative flex flex-col rounded-2xl border p-8 transition-all border-border/40 bg-[hsl(var(--marketing-surface))]">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--marketing-surface-alt))] text-[hsl(var(--marketing-text-muted))]">
                <Users size={20} />
              </div>
              <h3 className="text-lg font-semibold text-[hsl(var(--marketing-text))]">Add ons</h3>
            </div>
            <p className="mt-2 text-sm text-[hsl(var(--marketing-text-muted))]">
              Add teammates and AI agents when you’re ready.
            </p>
          </div>

          <ul className="mb-8 flex-1 space-y-3">
            {addOnItems.map((f) => (
              <li key={f.name} className="flex items-start gap-2.5 text-sm text-[hsl(var(--marketing-text))]">
                <Check size={16} className="mt-0.5 flex-shrink-0 text-[hsl(var(--marketing-accent))]" />
                {f.name}
              </li>
            ))}
          </ul>

          <Link to="/auth" className="mt-auto">
            <Button className="w-full" variant="outline" size="lg">
              Start Free <ArrowRight size={16} />
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
