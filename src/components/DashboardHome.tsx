import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChartContainer } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ListTodo, Loader2, CheckCircle2, FolderOpen, Bot, Users, MessageSquare,
  CalendarDays, Archive, BookOpen, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Profile } from '@/hooks/useProfile';
import type { Agent } from '@/hooks/useAgents';
import type { Project } from '@/hooks/useTasks';
import { format } from 'date-fns';

interface DashboardHomeProps {
  profile: Profile | null;
  projects: Project[];
  agents: Agent[];
  totalUnread: number;
  onNewProject: () => void;
  onSelectProject: (id: string) => void;
  onNavigate: (tab: 'chat' | 'calendar' | 'archive' | 'agents') => void;
}

const STATUS_COLORS = {
  open: 'hsl(var(--status-open))',
  in_progress: 'hsl(var(--status-progress))',
  complete: 'hsl(var(--status-done))',
};

export default function DashboardHome({
  profile, projects, agents, totalUnread,
  onNewProject, onSelectProject, onNavigate,
}: DashboardHomeProps) {
  const { allTasks, teamMembers, loading } = useDashboardStats();

  const stats = useMemo(() => {
    const open = allTasks.filter(t => t.status === 'open').length;
    const inProgress = allTasks.filter(t => t.status === 'in_progress').length;
    const complete = allTasks.filter(t => t.status === 'complete').length;
    return { open, inProgress, complete };
  }, [allTasks]);

  const pieData = useMemo(() => [
    { name: 'Open', value: stats.open, color: STATUS_COLORS.open },
    { name: 'In Progress', value: stats.inProgress, color: STATUS_COLORS.in_progress },
    { name: 'Complete', value: stats.complete, color: STATUS_COLORS.complete },
  ].filter(d => d.value > 0), [stats]);

  const barData = useMemo(() => {
    const projectMap: Record<string, { name: string; open: number; in_progress: number; complete: number }> = {};
    for (const t of allTasks) {
      if (!projectMap[t.project_id]) {
        const p = projects.find(pp => pp.id === t.project_id);
        projectMap[t.project_id] = { name: p?.name || 'Unknown', open: 0, in_progress: 0, complete: 0 };
      }
      if (t.status === 'open') projectMap[t.project_id].open++;
      else if (t.status === 'in_progress') projectMap[t.project_id].in_progress++;
      else if (t.status === 'complete') projectMap[t.project_id].complete++;
    }
    return Object.values(projectMap)
      .sort((a, b) => (b.open + b.in_progress + b.complete) - (a.open + a.in_progress + a.complete))
      .slice(0, 8);
  }, [allTasks, projects]);

  const agentStats = useMemo(() => {
    return agents.map(agent => {
      const assigned = allTasks.filter(t => t.assigned_to === agent.id && t.assigned_type === 'agent');
      return {
        ...agent,
        open: assigned.filter(t => t.status === 'open').length,
        inProgress: assigned.filter(t => t.status === 'in_progress').length,
        complete: assigned.filter(t => t.status === 'complete').length,
        total: assigned.length,
      };
    });
  }, [agents, allTasks]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid md:grid-cols-5 gap-4">
          <Skeleton className="h-64 rounded-xl md:col-span-3" />
          <Skeleton className="h-64 rounded-xl md:col-span-2" />
        </div>
      </div>
    );
  }

  const chartConfig = {
    open: { label: 'Open', color: STATUS_COLORS.open },
    in_progress: { label: 'In Progress', color: STATUS_COLORS.in_progress },
    complete: { label: 'Complete', color: STATUS_COLORS.complete },
  };

  const statCards = [
    { label: 'Open Tasks', value: stats.open, icon: ListTodo, accent: 'hsl(var(--status-open))' },
    { label: 'In Progress', value: stats.inProgress, icon: Loader2, accent: 'hsl(var(--status-progress))' },
    { label: 'Completed', value: stats.complete, icon: CheckCircle2, accent: 'hsl(var(--status-done))' },
    { label: 'Projects', value: projects.length, icon: FolderOpen, accent: 'hsl(262 72% 56%)' },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {greeting}, {profile?.display_name || 'there'} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <Button size="sm" onClick={onNewProject} className="gap-1.5">
            <Plus size={14} /> New Project
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {statCards.map((card, i) => (
            <Card
              key={card.label}
              className="rounded-xl border-border animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${card.accent}20`, color: card.accent }}
                >
                  <card.icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-none">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts + Sidebar */}
        <div className="grid md:grid-cols-5 gap-4">
          {/* Left Column */}
          <div className="md:col-span-3 space-y-4">
            {/* Task Distribution Donut */}
            <Card className="rounded-xl border-border animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-sm font-semibold text-foreground">Task Distribution</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {pieData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="aspect-auto h-[200px]">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-lg">
                              <span className="font-medium">{d.name}</span>: {d.value}
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No tasks yet</p>
                )}
                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-2">
                  {[
                    { label: 'Open', color: STATUS_COLORS.open },
                    { label: 'In Progress', color: STATUS_COLORS.in_progress },
                    { label: 'Complete', color: STATUS_COLORS.complete },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                      {item.label}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tasks by Project Bar Chart */}
            {barData.length > 0 && (
              <Card className="rounded-xl border-border animate-fade-in-up" style={{ animationDelay: '260ms' }}>
                <CardHeader className="pb-2 px-4 pt-4">
                  <CardTitle className="text-sm font-semibold text-foreground">Tasks by Project</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <ChartContainer config={chartConfig} className="aspect-auto h-[220px]">
                    <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11 }}
                        className="fill-muted-foreground"
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-lg space-y-0.5">
                              <p className="font-medium">{label}</p>
                              {payload.map((p: any) => (
                                <p key={p.dataKey}>
                                  <span style={{ color: p.fill }} className="font-medium">{p.name}</span>: {p.value}
                                </p>
                              ))}
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="open" stackId="a" fill={STATUS_COLORS.open} name="Open" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="in_progress" stackId="a" fill={STATUS_COLORS.in_progress} name="In Progress" />
                      <Bar dataKey="complete" stackId="a" fill={STATUS_COLORS.complete} name="Complete" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="md:col-span-2 space-y-4">
            {/* Agents Card */}
            <Card className="rounded-xl border-border animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Bot size={15} className="text-muted-foreground" />
                  AI Agents ({agents.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {agentStats.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No agents configured</p>
                ) : (
                  <div className="space-y-2.5">
                    {agentStats.map(agent => (
                      <div key={agent.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Bot size={14} className="text-muted-foreground" />
                          </div>
                          <span className="text-sm font-medium text-foreground truncate">{agent.display_name}</span>
                        </div>
                        {agent.total > 0 && (
                          <div className="flex items-center gap-2 text-[10px] shrink-0">
                            <span style={{ color: STATUS_COLORS.open }}>{agent.open}</span>
                            <span style={{ color: STATUS_COLORS.in_progress }}>{agent.inProgress}</span>
                            <span style={{ color: STATUS_COLORS.complete }}>{agent.complete}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Members Card */}
            <Card className="rounded-xl border-border animate-fade-in-up" style={{ animationDelay: '360ms' }}>
              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Users size={15} className="text-muted-foreground" />
                  Team Members ({teamMembers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {teamMembers.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No team members yet</p>
                ) : (
                  <div className="space-y-2">
                    {teamMembers.slice(0, 8).map(m => (
                      <div key={m.user_id} className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7">
                          {m.avatar_url && <AvatarImage src={m.avatar_url} />}
                          <AvatarFallback className="text-[9px] bg-muted">
                            {m.display_name ? m.display_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate leading-tight">
                            {m.display_name || 'Unnamed'}
                          </p>
                          {m.username && (
                            <p className="text-[10px] text-muted-foreground truncate leading-tight">@{m.username}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {teamMembers.length > 8 && (
                      <p className="text-[10px] text-muted-foreground">+{teamMembers.length - 8} more</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="rounded-xl border-border animate-fade-in-up" style={{ animationDelay: '420ms' }}>
              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-sm font-semibold text-foreground">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-1">
                {[
                  { icon: MessageSquare, label: 'Messages', tab: 'chat' as const, badge: totalUnread },
                  { icon: CalendarDays, label: 'Calendar', tab: 'calendar' as const },
                  { icon: Archive, label: 'Archive', tab: 'archive' as const },
                  { icon: Bot, label: 'Manage Agents', tab: 'agents' as const },
                ].map(link => (
                  <button
                    key={link.tab}
                    onClick={() => onNavigate(link.tab)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <link.icon size={15} />
                    <span className="flex-1 text-left">{link.label}</span>
                    {link.badge ? (
                      <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
                        {link.badge > 9 ? '9+' : link.badge}
                      </span>
                    ) : null}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
