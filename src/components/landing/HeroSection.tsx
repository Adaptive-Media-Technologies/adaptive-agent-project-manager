import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Bot, Clock, MessageSquare } from 'lucide-react';

const DashboardMockup = () => (
  <div className="animate-float rounded-2xl border border-border/60 bg-[hsl(var(--marketing-surface))] shadow-2xl shadow-[hsl(var(--marketing-accent))/0.1] overflow-hidden max-w-4xl mx-auto">
    <div className="flex">
      {/* Sidebar mock */}
      <div className="hidden md:flex flex-col w-48 bg-[hsl(222,30%,14%)] p-3 gap-2">
        <div className="h-8 w-full rounded-lg bg-white/10 mb-2" />
        {['Dashboard', 'My Tasks', 'Agents', 'Calendar'].map((item, i) => (
          <div key={item} className={`h-8 px-3 rounded-lg flex items-center text-xs font-medium ${i === 0 ? 'bg-[hsl(36,90%,55%)] text-[hsl(36,90%,12%)]' : 'text-white/60'}`}>
            {item}
          </div>
        ))}
      </div>
      {/* Main content mock */}
      <div className="flex-1 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-32 rounded bg-[hsl(var(--muted))]" />
          <div className="flex gap-2">
            <div className="h-7 w-20 rounded-lg bg-[hsl(var(--marketing-accent))/0.1] text-[hsl(var(--marketing-accent))] text-xs flex items-center justify-center font-medium">+ Add Task</div>
          </div>
        </div>
        {/* Task rows */}
        {[
          { title: 'Refactor auth module', status: 'In Progress', agent: true, color: 'hsl(199,80%,56%)' },
          { title: 'Write API docs', status: 'Done', agent: true, color: 'hsl(142,60%,40%)' },
          { title: 'Review PR #142', status: 'Open', agent: false, color: 'hsl(220,10%,46%)' },
          { title: 'Deploy staging build', status: 'In Progress', agent: true, color: 'hsl(199,80%,56%)' },
        ].map((task, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
            <div className={`h-3 w-3 rounded-full`} style={{ backgroundColor: task.color }} />
            <span className="text-sm text-[hsl(var(--marketing-text))] flex-1">{task.title}</span>
            {task.agent && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-[hsl(var(--marketing-accent))] bg-[hsl(var(--marketing-accent))/0.08] rounded-full px-2 py-0.5">
                <Bot size={10} /> Agent
              </span>
            )}
            <span className="text-xs text-[hsl(var(--marketing-text-muted))]">{task.status}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const HeroSection = () => (
  <section className="relative overflow-hidden">
    <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-[hsl(var(--marketing-gradient-start))/0.08] blur-3xl" />
    <div className="absolute top-20 right-1/4 h-[500px] w-[500px] rounded-full bg-[hsl(var(--marketing-gradient-end))/0.06] blur-3xl" />

    <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-8 md:pt-24 md:pb-12">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight text-[hsl(var(--marketing-text))] sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08]">
          One workspace for your team and{' '}
          <span className="bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] via-[hsl(var(--marketing-gradient-mid))] to-[hsl(var(--marketing-gradient-end))] bg-clip-text text-transparent">
            AI agents
          </span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-[hsl(var(--marketing-text-muted))] leading-relaxed max-w-2xl mx-auto">
          Agntive unifies messaging, task tracking, and autonomous AI automation into a single smart workspace — so small teams stop juggling Slack, Notion, and generic bots.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-2">
          <Link to="/auth">
            <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] via-[hsl(var(--marketing-gradient-mid))] to-[hsl(var(--marketing-gradient-end))] text-white border-0 shadow-lg shadow-[hsl(var(--marketing-accent))/0.3] hover:shadow-xl hover:shadow-[hsl(var(--marketing-accent))/0.4] transition-all">
              Start Forever Free Today <ArrowRight size={18} />
            </Button>
          </Link>
          <div className="text-sm text-[hsl(var(--marketing-text-muted))]">
            1 user for free forever
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-[hsl(var(--marketing-text-muted))]">
          {['1 user free forever', 'No credit card required', 'Set up in 2 minutes'].map(item => (
            <span key={item} className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[hsl(var(--marketing-accent))]" />
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <DashboardMockup />
      </div>
    </div>
  </section>
);

export default HeroSection;
