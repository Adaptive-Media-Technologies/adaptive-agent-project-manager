import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, BarChart3, Radio, ArrowRight } from 'lucide-react';

const highlights = [
  {
    icon: MessageSquare,
    title: 'Assign tasks from chat',
    description: 'OpenClaw picks up tasks from your project board and updates status as it works.',
  },
  {
    icon: BarChart3,
    title: 'Automatic token tracking',
    description: 'Every API call is logged and attributed. Know exactly what each agent run costs.',
  },
  {
    icon: Radio,
    title: 'Real-time status updates',
    description: 'See your agents working live in the dashboard with instant progress notifications.',
  },
];

const OpenClawSection = () => (
  <section id="openclaw" className="py-20 md:py-28 bg-[hsl(222,30%,8%)] text-white relative overflow-hidden">
    <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-[hsl(var(--marketing-gradient-start))/0.06] blur-3xl" />
    <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-[hsl(var(--marketing-gradient-end))/0.04] blur-3xl" />

    <div className="relative mx-auto max-w-6xl px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/70">
          🤖 Powered by OpenClaw
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Give{' '}
            <span className="bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] to-[hsl(var(--marketing-gradient-end))] bg-clip-text text-transparent">
              OpenClaw
            </span>{' '}
            a command center
          </h2>
          <p className="mt-4 text-lg text-white/60 leading-relaxed">
            Connect OpenClaw agents to your workspace. They pick up tasks, report progress, and log token usage — automatically.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="https://openclaw.ai" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="h-12 px-8 bg-white text-[hsl(222,30%,8%)] hover:bg-white/90">
                Connect OpenClaw <ArrowRight size={18} />
              </Button>
            </a>
            <a href="https://openclaw.ai" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="h-12 px-8 border-white/20 text-white hover:bg-white/10">
                View Docs
              </Button>
            </a>
          </div>
        </div>

        <div className="space-y-4">
          {highlights.map((h, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--marketing-gradient-start))/0.2] to-[hsl(var(--marketing-gradient-end))/0.2]">
                  <h.icon size={20} className="text-[hsl(var(--marketing-gradient-start))]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{h.title}</h3>
                  <p className="mt-1 text-sm text-white/50 leading-relaxed">{h.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default OpenClawSection;
