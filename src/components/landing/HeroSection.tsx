import { Link } from 'react-router-dom';
import { Menu, Zap, BarChart3, Settings, Bot, ListChecks, Timer } from 'lucide-react';
import LandingLogo from './LandingLogo';

const HeroSection = () => (
  <section className="relative bg-[hsl(var(--marketing-surface))] px-4 py-8 lg:px-8 lg:py-12">
    <div className="mx-auto w-full max-w-6xl border border-[hsl(var(--marketing-border))] bg-[hsl(var(--marketing-surface-alt))] flex flex-col overflow-hidden shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6),inset_0_1px_0_hsl(0_0%_100%/0.04)]">
      {/* Status strip (no duplicate logo/CTA — main nav covers that) */}
      <div className="h-10 border-b border-[hsl(var(--marketing-border))] flex items-center justify-between px-4 bg-[hsl(var(--marketing-surface))]">
        <div className="flex items-center gap-2 text-[10px] font-mono text-[hsl(var(--marketing-text-muted))] tracking-widest">
          <Menu className="w-3 h-3" />
          WORKSPACE / OVERVIEW
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 border border-[hsl(var(--marketing-border))] bg-[hsl(var(--marketing-surface-raised))] rounded text-[10px] font-mono text-[hsl(var(--marketing-text))]">
          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--marketing-warning))] animate-pulse" />
          SYSTEM_ACTIVE
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left icon rail */}
        <aside className="hidden md:flex w-16 border-r border-[hsl(var(--marketing-border))] bg-[hsl(var(--marketing-surface))] flex-col items-center py-6 gap-4">
          <div className="relative w-8 h-8 flex items-center justify-center border border-[hsl(var(--marketing-border-strong))] bg-[hsl(var(--marketing-surface-raised))] rounded text-[hsl(var(--marketing-text))]">
            <span className="absolute -left-[9px] top-1 bottom-1 w-0.5 bg-[hsl(var(--marketing-accent))] rounded-full" />
            <Menu className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 flex items-center justify-center text-[hsl(var(--marketing-text-muted))] hover:text-[hsl(var(--marketing-text))] transition-colors">
            <ListChecks className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 flex items-center justify-center text-[hsl(var(--marketing-text-muted))] hover:text-[hsl(var(--marketing-text))] transition-colors">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div className="mt-auto w-8 h-8 flex items-center justify-center text-[hsl(var(--marketing-text-muted))]">
            <Settings className="w-4 h-4" />
          </div>
        </aside>

        <main className="flex-1 flex flex-col">
          {/* Hero */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 py-16 md:py-24 text-center border-b border-[hsl(var(--marketing-border))] relative overflow-hidden bg-[hsl(var(--marketing-surface))]">
            <div
              className="absolute inset-0 opacity-[0.08] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(hsl(var(--marketing-text-muted)) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <div
              className="absolute inset-x-0 top-0 h-64 pointer-events-none opacity-40"
              style={{
                background:
                  'radial-gradient(ellipse at top, hsl(var(--marketing-accent) / 0.15), transparent 60%)',
              }}
            />
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-2 py-1 mb-6 border border-[hsl(var(--marketing-border-strong))] bg-[hsl(var(--marketing-surface-raised))] text-[10px] font-mono tracking-widest text-[hsl(var(--marketing-text-muted))]">
                <span className="w-1 h-1 rounded-full bg-[hsl(var(--marketing-accent))]" />
                AGNTIVE_v1.0 / TEAMS + AGENTS
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] text-[hsl(var(--marketing-text))] mb-6">
                One workspace for your team and{' '}
                <span className="relative inline-block">
                  <span className="relative z-10">AI agents.</span>
                  <span className="absolute inset-x-0 bottom-1 h-3 bg-[hsl(var(--marketing-warning)/0.35)] -z-0" />
                </span>
              </h1>
              <p className="text-base md:text-lg text-[hsl(var(--marketing-text-muted))] max-w-xl mx-auto mb-10 leading-relaxed">
                Tasks, chat, notes, and autonomous agents in a single instrument-grade surface.
                Built for small teams who want signal, not slop.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/auth"
                  className="px-6 py-3 bg-[hsl(var(--marketing-accent))] text-[hsl(var(--marketing-accent-foreground))] font-bold text-sm tracking-wide rounded-sm hover:brightness-110 transition-all shadow-[0_8px_24px_-8px_hsl(var(--marketing-accent)/0.6)]"
                >
                  START FREE
                </Link>
                <Link
                  to="/docs"
                  className="px-6 py-3 border border-[hsl(var(--marketing-border-strong))] bg-[hsl(var(--marketing-surface-raised))] text-[hsl(var(--marketing-text))] font-bold text-sm tracking-wide rounded-sm hover:border-[hsl(var(--marketing-text-muted))] transition-colors"
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
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[hsl(var(--marketing-border))] bg-[hsl(var(--marketing-surface-alt))]">
            <div className="flex-1 p-4 min-h-[192px]">
              <div className="text-[10px] font-bold text-[hsl(var(--marketing-text-muted))] mb-3 tracking-widest">
                ACTIVITY_FEED
              </div>
              <div className="font-mono text-[11px] space-y-1.5">
                <div className="flex gap-2">
                  <span className="text-[hsl(var(--marketing-text-dim))]">14:02</span>
                  <span className="text-[hsl(var(--marketing-accent))]">[TASK]</span>
                  <span className="text-[hsl(var(--marketing-text))]">"Refactor auth module" → in_progress</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[hsl(var(--marketing-text-dim))]">14:04</span>
                  <span className="text-[hsl(var(--marketing-warning))]">[AGENT]</span>
                  <span className="text-[hsl(var(--marketing-text))]">code-agent opened PR #142</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[hsl(var(--marketing-text-dim))]">14:07</span>
                  <span className="text-[hsl(var(--marketing-text))]">[CHAT]</span>
                  <span className="text-[hsl(var(--marketing-text-muted))]">kath: shipping staging build</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[hsl(var(--marketing-text-dim))]">14:11</span>
                  <span className="text-[hsl(var(--marketing-success))]">[TIME]</span>
                  <span className="text-[hsl(var(--marketing-text-muted))]">+00:42:18 logged · "Write API docs"</span>
                </div>
                <div className="flex gap-2 animate-pulse">
                  <span className="text-[hsl(var(--marketing-text-dim))]">&gt;</span>
                  <span className="bg-[hsl(var(--marketing-accent))] text-[hsl(var(--marketing-accent-foreground))] px-1">
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
                      className={
                        i === 4
                          ? 'bg-[hsl(var(--marketing-accent))] w-full rounded-t-[1px]'
                          : 'bg-[hsl(var(--marketing-border-strong))] w-full rounded-t-[1px]'
                      }
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
                  <span className="text-[hsl(var(--marketing-warning))]">3</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right auxiliary */}
        <aside className="hidden xl:flex w-64 border-l border-[hsl(var(--marketing-border))] bg-[hsl(var(--marketing-surface))] flex-col p-4">
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
              <div
                key={item.label}
                className="p-3 border border-[hsl(var(--marketing-border))] bg-[hsl(var(--marketing-surface-raised))] shadow-[inset_0_1px_0_hsl(0_0%_100%/0.04)]"
              >
                <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[hsl(var(--marketing-text-muted))] mb-1">
                  <item.icon className="w-3 h-3 text-[hsl(var(--marketing-accent))]" />
                  {item.label}
                </div>
                <div className="text-[11px] text-[hsl(var(--marketing-text))]">{item.value}</div>
              </div>
            ))}
            <div className="p-3 border border-dashed border-[hsl(var(--marketing-border-strong))] text-[hsl(var(--marketing-text-muted))] flex items-center justify-center text-[10px] font-mono hover:text-[hsl(var(--marketing-text))] hover:border-[hsl(var(--marketing-text-muted))] transition-colors cursor-pointer">
              + ADD MODULE
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>
);

export default HeroSection;
