import { useState } from 'react';
import { CheckSquare, Bot, Clock, MessageSquare, CalendarDays, Plug } from 'lucide-react';

const tabs = [
  {
    id: 'tasks',
    icon: CheckSquare,
    label: 'Task Management',
    headline: 'Tasks designed for humans and AI agents',
    description: 'Assign work to team members or autonomous agents from the same board. Track status, due dates, and file attachments — no separate tools needed.',
    mockContent: (
      <div className="space-y-3">
        {['Design landing page', 'Write unit tests', 'Deploy to staging', 'Research competitor APIs'].map((t, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl bg-[hsl(var(--marketing-surface))]/10 border border-white/10 backdrop-blur-sm p-3">
            <div className={`h-4 w-4 rounded border-2 ${i === 1 ? 'bg-[hsl(142,60%,40%)] border-[hsl(142,60%,40%)]' : 'border-white/30'}`} />
            <span className="text-sm font-medium text-[hsl(var(--marketing-text))] flex-1">{t}</span>
            <span className="text-xs text-[hsl(var(--marketing-text-muted))]">{i < 2 ? 'Today' : 'Tomorrow'}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'agents',
    icon: Bot,
    label: 'Agent Tracking',
    headline: 'Monitor your AI agents in real-time',
    description: 'See which agents are active, what they\'re working on, and their completion rates. Full visibility replaces guesswork.',
    mockContent: (
      <div className="space-y-3">
        {[
          { name: 'CodeBot', status: 'Active', task: 'Refactoring auth.ts', tokens: '12.4k' },
          { name: 'ResearchAI', status: 'Idle', task: '—', tokens: '8.1k' },
          { name: 'OpsAgent', status: 'Active', task: 'Monitoring deploys', tokens: '3.2k' },
        ].map((a, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl bg-[hsl(var(--marketing-surface))]/10 border border-white/10 backdrop-blur-sm p-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[hsl(var(--marketing-gradient-start))] to-[hsl(var(--marketing-gradient-end))] flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[hsl(var(--marketing-text))]">{a.name}</p>
              <p className="text-xs text-[hsl(var(--marketing-text-muted))]">{a.task}</p>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${a.status === 'Active' ? 'bg-[hsl(142,60%,40%)]/10 text-[hsl(142,60%,40%)]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--marketing-text-muted))]'}`}>
              {a.status}
            </span>
            <span className="text-xs text-[hsl(var(--marketing-text-muted))]">{a.tokens}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'tokens',
    icon: Clock,
    label: 'Time & Token Logs',
    headline: 'Track every hour and every token',
    description: 'Automatic token logging per agent and time tracking for humans. Know exactly what your AI costs and where team effort goes.',
    mockContent: (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Tokens Today', value: '48.2k' },
            { label: 'Human Hours', value: '6.5h' },
            { label: 'Est. Cost', value: '$2.40' },
          ].map((s, i) => (
            <div key={i} className="rounded-xl bg-[hsl(var(--marketing-surface))]/10 border border-white/10 backdrop-blur-sm p-3 text-center">
              <p className="text-xs text-[hsl(var(--marketing-text-muted))]">{s.label}</p>
              <p className="text-lg font-bold text-[hsl(var(--marketing-text))]">{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-1 items-end h-20">
          {[40, 65, 30, 80, 55, 70, 45, 90, 60, 75, 50, 85].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t from-[hsl(var(--marketing-gradient-start))] to-[hsl(var(--marketing-gradient-end))] opacity-70"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'chat',
    icon: MessageSquare,
    label: 'Team Chat',
    headline: 'Conversations that live with your work',
    description: 'In-context project chat replaces Slack threads. Discuss tasks, share files, and coordinate with AI agents — without switching apps.',
    mockContent: (
      <div className="space-y-3">
        {[
          { name: 'Sarah', msg: 'CodeBot just finished the auth refactor 🎉', time: '2m ago' },
          { name: 'CodeBot', msg: 'PR #142 ready for review. 847 tokens used.', time: '3m ago', agent: true },
          { name: 'Mike', msg: 'Reviewing now, looks clean!', time: '1m ago' },
        ].map((m, i) => (
          <div key={i} className="flex gap-3 rounded-xl bg-[hsl(var(--marketing-surface))]/10 border border-white/10 backdrop-blur-sm p-3">
            <div className={`h-7 w-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white ${m.agent ? 'bg-gradient-to-br from-[hsl(var(--marketing-gradient-start))] to-[hsl(var(--marketing-gradient-end))]' : 'bg-[hsl(var(--marketing-text-muted))]'}`}>
              {m.agent ? <Bot size={12} /> : m.name[0]}
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-[hsl(var(--marketing-text))]">{m.name} <span className="font-normal text-[hsl(var(--marketing-text-muted))]">{m.time}</span></p>
              <p className="text-sm text-[hsl(var(--marketing-text-muted))]">{m.msg}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'calendar',
    icon: CalendarDays,
    label: 'Calendar',
    headline: 'Every deadline, one unified view',
    description: 'See tasks from every project on a unified calendar. Filter by assignee, status, or project. Never miss a deadline again.',
    mockContent: (
      <div className="grid grid-cols-7 gap-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center text-xs font-medium text-[hsl(var(--marketing-text-muted))] py-1">{d}</div>
        ))}
        {Array.from({ length: 28 }, (_, i) => (
          <div
            key={i}
            className={`text-center text-xs py-2 rounded-lg ${
              [4, 11, 15, 22].includes(i)
                ? 'bg-gradient-to-br from-[hsl(var(--marketing-gradient-start))/0.15] to-[hsl(var(--marketing-gradient-end))/0.15] text-[hsl(var(--marketing-accent))] font-bold'
                : 'text-[hsl(var(--marketing-text-muted))]'
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'api',
    icon: Plug,
    label: 'API & Automations',
    headline: 'Connect any AI agent via API',
    description: 'REST API and webhooks for integrating custom agents. Bring your own AI stack and connect it in minutes.',
    mockContent: (
      <div className="rounded-xl bg-[hsl(222,30%,14%)] p-4 font-mono text-xs text-green-400 space-y-1">
        <p className="text-[hsl(var(--marketing-text-muted))]">// Create a task via API</p>
        <p>POST /api/v1/tasks</p>
        <p className="text-yellow-300">{'{'}</p>
        <p className="pl-4">"title": "Deploy v2.0",</p>
        <p className="pl-4">"assignee": "code-agent",</p>
        <p className="pl-4">"project": "main-app"</p>
        <p className="text-yellow-300">{'}'}</p>
        <p className="mt-2 text-emerald-300">✓ 201 Created</p>
      </div>
    ),
  },
];

const FeatureShowcase = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const active = tabs.find(t => t.id === activeTab)!;

  return (
    <section id="features" className="bg-[hsl(var(--marketing-surface-alt))] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[hsl(var(--marketing-text))]">
            Everything your team needs in one workspace
          </h2>
          <p className="mt-4 text-[hsl(var(--marketing-text-muted))] max-w-2xl mx-auto">
            Messaging, tasks, AI automation, and project context — unified so nothing falls through the cracks.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === t.id
                  ? 'bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] to-[hsl(var(--marketing-gradient-end))] text-white shadow-lg shadow-[hsl(var(--marketing-accent))/0.25]'
                  : 'bg-[hsl(var(--marketing-surface))] text-[hsl(var(--marketing-text-muted))] hover:text-[hsl(var(--marketing-text))] border border-border/60'
              }`}
            >
              <t.icon size={16} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Active tab content */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-2xl font-bold text-[hsl(var(--marketing-text))]">{active.headline}</h3>
            <p className="mt-4 text-[hsl(var(--marketing-text-muted))] leading-relaxed">{active.description}</p>
            <a href="/auth" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--marketing-accent))] hover:underline">
              Learn more <span>→</span>
            </a>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[hsl(var(--marketing-surface-alt))]/80 p-6">
            {active.mockContent}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
