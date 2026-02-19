import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bot, CheckCircle2, CalendarDays, Users, Timer, FolderOpen, ArrowRight, Sparkles, BarChart3, Zap } from 'lucide-react';
import agntfindLogo from '@/assets/agntfind-logo.png';

const features = [
  {
    icon: Bot,
    title: 'AI Agent Management',
    description: 'Track and manage your AI agents across multiple projects with real-time status updates and performance metrics.',
  },
  {
    icon: Timer,
    title: 'Token & Time Tracking',
    description: 'Monitor token usage and time spent per task. Never lose track of AI costs or human effort again.',
  },
  {
    icon: FolderOpen,
    title: 'Multi-Project Workspace',
    description: 'Organize work across unlimited projects — private or team-based — all in one unified dashboard.',
  },
  {
    icon: CalendarDays,
    title: 'Calendar View',
    description: 'See all your tasks across every project on a single calendar. Never miss a deadline.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Invite teammates, assign tasks, and chat within projects. Built for distributed AI teams.',
  },
  {
    icon: BarChart3,
    title: 'Usage Analytics',
    description: 'Coming soon — detailed dashboards showing agent performance, token burn rates, and productivity insights.',
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[hsl(var(--marketing-surface))]">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-[hsl(var(--marketing-surface))/0.85] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={agntfindLogo} alt="Agntive" className="h-8 w-8 rounded-xl" />
            <span className="text-lg font-bold tracking-tight text-[hsl(var(--marketing-text))]">Agntive<span className="text-[hsl(var(--marketing-accent))]">.ai</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-[hsl(var(--marketing-text-muted))]">
            <a href="#features" className="hover:text-[hsl(var(--marketing-text))] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[hsl(var(--marketing-text))] transition-colors">How it works</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] via-[hsl(var(--marketing-gradient-mid))] to-[hsl(var(--marketing-gradient-end))] text-white border-0 shadow-lg shadow-[hsl(var(--marketing-accent))/0.25] hover:shadow-xl hover:shadow-[hsl(var(--marketing-accent))/0.35] transition-all">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Gradient blobs */}
        <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-[hsl(var(--marketing-gradient-start))/0.08] blur-3xl" />
        <div className="absolute top-20 right-1/4 h-[500px] w-[500px] rounded-full bg-[hsl(var(--marketing-gradient-end))/0.06] blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-32 md:pb-36">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--marketing-accent))/0.2] bg-[hsl(var(--marketing-accent))/0.05] px-4 py-1.5 text-sm font-medium text-[hsl(var(--marketing-accent))]">
              <Sparkles size={14} />
              Project Management for AI Agents
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-[hsl(var(--marketing-text))] sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08]">
              Manage your AI agents
              <span className="block bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] via-[hsl(var(--marketing-gradient-mid))] to-[hsl(var(--marketing-gradient-end))] bg-clip-text text-transparent">
                like never before
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-[hsl(var(--marketing-text-muted))] leading-relaxed">
              The all-in-one project management platform built for AI-first teams. Track agents, monitor token usage, manage tasks, and ship faster.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] via-[hsl(var(--marketing-gradient-mid))] to-[hsl(var(--marketing-gradient-end))] text-white border-0 shadow-lg shadow-[hsl(var(--marketing-accent))/0.3] hover:shadow-xl hover:shadow-[hsl(var(--marketing-accent))/0.4] transition-all">
                  Get Started Free <ArrowRight size={18} />
                </Button>
              </Link>
              <p className="text-sm text-[hsl(var(--marketing-text-muted))]">Free forever · No credit card</p>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-[hsl(var(--marketing-text-muted))]">
              {['Task & Project Management', 'Token Usage Tracking', 'Team Collaboration', 'Calendar View'].map(item => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[hsl(var(--marketing-accent))]" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-[hsl(var(--marketing-surface-alt))] py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[hsl(var(--marketing-text))] md:text-4xl">
              Everything you need to manage AI agents
            </h2>
            <p className="mt-4 text-[hsl(var(--marketing-text-muted))] max-w-2xl mx-auto">
              Purpose-built for teams running AI agents. Track costs, manage tasks, and collaborate — all in one place.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-border/60 bg-[hsl(var(--marketing-surface))] p-6 transition-all hover:shadow-lg hover:shadow-[hsl(var(--marketing-accent))/0.06] hover:border-[hsl(var(--marketing-accent))/0.3]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--marketing-gradient-start))/0.1] to-[hsl(var(--marketing-gradient-end))/0.1]">
                  <f.icon size={22} className="text-[hsl(var(--marketing-accent))]" />
                </div>
                <h3 className="text-base font-semibold text-[hsl(var(--marketing-text))]">{f.title}</h3>
                <p className="mt-2 text-sm text-[hsl(var(--marketing-text-muted))] leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[hsl(var(--marketing-text))] md:text-4xl">
              Get started in minutes
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Create your workspace', desc: 'Sign up free and set up your first project in seconds.' },
              { step: '02', title: 'Add your AI agents', desc: 'Connect your agents and start tracking tasks, tokens, and time.' },
              { step: '03', title: 'Ship faster together', desc: 'Collaborate with your team and let AI agents handle the rest.' },
            ].map((s, i) => (
              <div key={i} className="text-center md:text-left">
                <span className="text-5xl font-extrabold bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] to-[hsl(var(--marketing-gradient-end))] bg-clip-text text-transparent">{s.step}</span>
                <h3 className="mt-3 text-lg font-semibold text-[hsl(var(--marketing-text))]">{s.title}</h3>
                <p className="mt-2 text-sm text-[hsl(var(--marketing-text-muted))] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] via-[hsl(var(--marketing-gradient-mid))] to-[hsl(var(--marketing-gradient-end))] p-12 md:p-20 text-center">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZyIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+')] opacity-30" />
            <div className="relative">
              <Zap size={40} className="mx-auto mb-4 text-white/80" />
              <h2 className="text-3xl font-bold text-white md:text-4xl">Ready to supercharge your AI workflow?</h2>
              <p className="mt-4 text-lg text-white/80 max-w-lg mx-auto">
                Join teams already using Agntive to manage their AI agents and ship faster.
              </p>
              <Link to="/auth" className="mt-8 inline-block">
                <Button size="lg" className="h-12 px-8 text-base bg-white text-[hsl(var(--marketing-accent))] hover:bg-white/90 shadow-xl">
                  Get Started Free <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={agntfindLogo} alt="Agntive" className="h-6 w-6 rounded-lg" />
            <span className="text-sm font-semibold text-[hsl(var(--marketing-text))]">Agntive.ai</span>
          </div>
          <p className="text-xs text-[hsl(var(--marketing-text-muted))]">
            © {new Date().getFullYear()} Agntive. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
