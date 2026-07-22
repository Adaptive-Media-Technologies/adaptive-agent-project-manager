import { Link } from 'react-router-dom';
import { Menu, Zap, BarChart3, Settings, Bot, ListChecks, Timer } from 'lucide-react';

const HeroSection = () => (
  <section className="relative bg-[hsl(var(--marketing-surface))] px-4 py-8 lg:px-8 lg:py-12">
    <div className="mx-auto w-full max-w-6xl border border-[hsl(var(--marketing-border))] bg-[hsl(var(--marketing-surface))] flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="h-14 border-b border-[hsl(var(--marketing-border))] flex items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[hsl(var(--marketing-text))] rounded-sm" />
            <span className="font-display font-bold tracking-tight text-lg text-[hsl(var(--marketing-text))]">Agntive</span>
          </div>
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-[hsl(var(--marketing-text-muted))]">
            <a href="#features" className="text-[hsl(var(--marketing-text))] px-2 py-1 bg-white/5 rounded">Workspace</a>
            <a href="#openclaw" className="px-2 py-1 hover:text-[hsl(var(--marketing-text))] transition-colors">Agents</a>
            <a href="#pricing" className="px-2 py-1 hover:text-[hsl(var(--marketing-text))] transition-colors">Pricing</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 border border-[hsl(var(--marketing-border))] rounded text-[10px] font-mono text-[hsl(var(--marketing-text-muted))]">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--marketing-accent))] animate-pulse" />
            SYSTEM_ACTIVE
          </div>
          <Link
            to="/auth"
            className="px-3 py-1.5 bg-[hsl(var(--marketing-text))] text-[hsl(var(--marketing-surface))] text-xs font-bold rounded-sm hover:bg-white transition-colors"
          >
            START FREE
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left icon rail */}
        <aside className="hidden md:flex w-16 border-r border-[hsl(var(--marketing-border))] flex-col items-center py-6 gap-6">
          <div className="w-8 h-8 flex items-center justify-center border border-[hsl(var(--marketing-border))] rounded text-[hsl(var(--marketing-text-muted))]">
            <Menu className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 flex items-center justify-center text-[hsl(var(--marketing-text-muted))]">
            <ListChecks className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 flex items-center justify-center text-[hsl(var(--marketing-text-muted))]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div className="mt-auto w-8 h-8 flex items-center justify-center text-[hsl(var(--marketing-text-muted))]">
            <Settings className="w-4 h-4" />
          </div>
        </aside>

        <main className="flex-1 flex flex-col">
          {/* Hero */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 py-16 md:py-24 text-center border-b border-[hsl(var(--marketing-border))] relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(hsl(var(--marketing-text-muted)) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="relative z-10 max-w-3xl">
              <div className="inline-block px-2 py-1 mb-6 border border-[hsl(var(--marketing-border))] text-[10px] font-mono tracking-widest text-[hsl(var(--marketing-text-muted))]">
                AGNTIVE_v1.0 / TEAMS + AGENTS
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] text-[hsl(var(--marketing-text))] mb-6">
                One workspace for your team and{' '}
                <span className="text-[hsl(var(--marketing-text-muted))]">AI agents.</span>
              </h1>
              <p className="text-base md:text-lg text-[hsl(var(--marketing-text-muted))] max-w-xl mx-auto mb-10 leading-relaxed">
                Tasks, chat, notes, and autonomous agents in a single instrument-grade surface.
                Built for small teams who want signal, not slop.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/auth"
                  className="px-6 py-3 bg-[hsl(var(--marketing-text))] text-[hsl(var(--marketing-surface))] font-bold text-sm tracking-wide rounded-sm hover:bg-white transition-colors"
                >
                  START FREE
                </Link>
                <Link
                  to="/docs"
                  className="px-6 py-3 border border-[hsl(var(--marketing-border))] text-[hsl(var(--marketing-text))] font-bold text-sm tracking-wide rounded-sm hover:bg-white/5 transition-colors"
                >
                  READ THE DOCS
                </Link>
              </div>
              <div className="mt-6 text-[11px] font-mono text-[hsl(var(--marketing-text-muted))]">
                1 USER FREE FOREVER · NO CARD REQUIRED
              </div>
            </div>
          </div>

          {/* Bottom panels */}
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[hsl(var(--marketing-border))]">
            <div className="flex-1 p-4 min-h-[192px]">
              <div className="text-[10px] font-bold text-[hsl(var(--marketing-text-muted))] mb-3 tracking-widest">
                ACTIVITY_FEED
              </div>
              <div className="font-mono text-[11px] space-y-1.5 text-[hsl(var(--marketing-text-muted))]">
                <div className="flex gap-2">
                  <span className="text-[hsl(var(--marketing-text-muted))]/60">14:02</span>
                  <span className="text-[hsl(var(--marketing-accent))]">[TASK]</span>
                  <span className="text-[hsl(var(--marketing-text))]">"Refactor auth module" → in_progress</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[hsl(var(--marketing-text-muted))]/60">14:04</span>
                  <span className="text-[hsl(var(--marketing-accent))]">[AGENT]</span>
                  <span className="text-[hsl(var(--marketing-text))]">code-agent opened PR #142</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[hsl(var(--marketing-text-muted))]/60">14:07</span>
                  <span className="text-[hsl(var(--marketing-accent))]">[CHAT]</span>
                  <span>kath: shipping staging build</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[hsl(var(--marketing-text-muted))]/60">14:11</span>
                  <span className="text-[hsl(var(--marketing-accent))]">[TIME]</span>
                  <span>+00:42:18 logged · "Write API docs"</span>
                </div>
                <div className="flex gap-2 animate-pulse">
                  <span className="text-[hsl(var(--marketing-text-muted))]/60">&gt;</span>
                  <span className="bg-[hsl(var(--marketing-text))] text-[hsl(var(--marketing-surface))] px-1">
                    awaiting_input_
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-64 p-4">
              <div className="text-[10px] font-bold text-[hsl(var(--marketing-text-muted))] mb-3 tracking-widest">
                THROUGHPUT
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-end h-10 gap-1">
                  {[40, 65, 55, 80, 100, 70, 90, 60, 75].map((h, i) => (
                    <div
                      key={i}
                      className={i === 4 ? 'bg-[hsl(var(--marketing-text))] w-full' : 'bg-[hsl(var(--marketing-border))] w-full'}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] font-mono text-[hsl(var(--marketing-text-muted))]">
                  <span>TASKS/HR</span>
                  <span className="text-[hsl(var(--marketing-text))]">42</span>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-[hsl(var(--marketing-text-muted))]">
                  <span>AGENTS_ACTIVE</span>
                  <span className="text-[hsl(var(--marketing-text))]">3</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right auxiliary */}
        <aside className="hidden xl:flex w-64 border-l border-[hsl(var(--marketing-border))] flex-col p-4">
          <div className="text-[10px] font-bold text-[hsl(var(--marketing-text-muted))] mb-6 tracking-widest">
            INSPECTOR
          </div>
          <div className="space-y-3">
            {[
              { label: 'TASKS', value: '18 open · 6 in progress', icon: ListChecks },
              { label: 'AGENTS', value: '3 deployed · 1 idle', icon: Bot },
              { label: 'TIME_TRACKED', value: '12h 04m this week', icon: Timer },
              { label: 'CHAT', value: '2 unread threads', icon: Zap },
            ].map((item) => (
              <div key={item.label} className="p-3 border border-[hsl(var(--marketing-border))] bg-white/[0.02]">
                <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[hsl(var(--marketing-text-muted))] mb-1">
                  <item.icon className="w-3 h-3" />
                  {item.label}
                </div>
                <div className="text-[11px] text-[hsl(var(--marketing-text))]">{item.value}</div>
              </div>
            ))}
            <div className="p-3 border border-dashed border-[hsl(var(--marketing-border))] text-[hsl(var(--marketing-text-muted))] flex items-center justify-center text-[10px] font-mono">
              + ADD MODULE
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>
);

export default HeroSection;
