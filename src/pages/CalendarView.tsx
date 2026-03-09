import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTeams } from '@/hooks/useTeams';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/hooks/useTasks';
import { Calendar } from '@/components/ui/calendar';
import { endOfMonth, format, isSameDay, parseISO, startOfMonth } from 'date-fns';
import { CalendarDays, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TaskTimeline from '@/components/TaskTimeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const statusConfig = {
  open: { label: 'Open', dot: 'bg-[hsl(var(--status-open))]', badge: 'bg-[hsl(var(--status-open)/0.1)] text-[hsl(var(--status-open))]' },
  in_progress: { label: 'In Progress', dot: 'bg-[hsl(var(--status-progress))]', badge: 'bg-[hsl(var(--status-progress)/0.1)] text-[hsl(var(--status-progress))]' },
  complete: { label: 'Done', dot: 'bg-[hsl(var(--status-done))]', badge: 'bg-[hsl(var(--status-done)/0.1)] text-[hsl(var(--status-done))]' },
};

type TaskWithProject = Task & { project_name?: string };
type CalendarProject = { id: string; name: string; type: 'private' | 'team'; team_id: string | null; archived: boolean };

const CalendarView = () => {
  const { user } = useAuth();
  const { teams } = useTeams();
  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [projects, setProjects] = useState<CalendarProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [mode, setMode] = useState<'month' | 'timeline'>('month');
  const [teamFilter, setTeamFilter] = useState<'all' | 'personal' | string>('all');
  const [projectFilter, setProjectFilter] = useState<'all' | string>('all');

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('projects')
      .select('id, name, type, team_id, archived')
      .eq('archived', false)
      .order('position')
      .order('created_at');
    setProjects((data as CalendarProject[]) || []);
  }, [user]);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    let query = supabase
      .from('tasks')
      .select('*, projects!inner(name, team_id, type, archived)')
      .not('due_date', 'is', null)
      .in('status', ['open', 'in_progress', 'complete'])
      .eq('projects.archived', false)
      .order('due_date');

    if (projectFilter !== 'all') {
      query = query.eq('project_id', projectFilter);
    } else if (teamFilter === 'personal') {
      query = query.eq('projects.type', 'private');
    } else if (teamFilter !== 'all') {
      query = query.eq('projects.team_id', teamFilter);
    }

    const { data } = await query;
    
    const mapped = (data || []).map((t: any) => ({
      ...t,
      status: t.status as Task['status'],
      project_name: t.projects?.name,
    }));
    setTasks(mapped);
    setLoading(false);
  }, [user, teamFilter, projectFilter]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);
  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Reset project filter when team changes.
  useEffect(() => {
    setProjectFilter('all');
  }, [teamFilter]);

  const filteredProjects = useMemo(() => {
    if (teamFilter === 'personal') return projects.filter(p => p.type === 'private');
    if (teamFilter !== 'all') return projects.filter(p => p.type === 'team' && p.team_id === teamFilter);
    return [];
  }, [projects, teamFilter]);

  const tasksForDate = selectedDate
    ? tasks.filter(t => t.due_date && isSameDay(parseISO(t.due_date), selectedDate))
    : [];

  const datesWithTasks = tasks
    .filter(t => t.due_date)
    .map(t => parseISO(t.due_date!));

  const timelineSections = useMemo(() => {
    const map = new Map<string, { label: string; taskIds: string[] }>();
    tasks.forEach(t => {
      const key = t.project_id;
      const label = t.project_name || 'Project';
      const existing = map.get(key);
      if (existing) existing.taskIds.push(t.id);
      else map.set(key, { label, taskIds: [t.id] });
    });
    return Array.from(map.entries()).map(([id, v]) => ({ id, label: v.label, taskIds: v.taskIds }));
  }, [tasks]);

  const updateDueDate = useCallback(async (id: string, dueDate: string | null) => {
    const { error } = await supabase.from('tasks').update({ due_date: dueDate }).eq('id', id);
    if (error) throw error;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, due_date: dueDate } : t));
  }, []);

  const updateStartDate = useCallback(async (id: string, startDate: string | null) => {
    const { error } = await supabase.from('tasks').update({ start_date: startDate } as any).eq('id', id);
    if (error) throw error;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, start_date: startDate } : t));
  }, []);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center gap-3 border-b border-border bg-card/80 backdrop-blur-sm px-6 py-3 shadow-sm">
        <CalendarDays size={20} className="text-primary" />
        <h2 className="text-lg font-bold text-foreground">Calendar</h2>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Calendar */}
        <div className="w-[340px] shrink-0 border-r border-border bg-card p-4 overflow-y-auto">
          {/* Filters */}
          <div className="mb-4 rounded-xl border border-border/60 bg-background p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Filter size={14} className="text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Filters</p>
            </div>

            <div className="space-y-2.5">
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-muted-foreground">Team</p>
                <Select value={teamFilter} onValueChange={(v) => setTeamFilter(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All teams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All teams</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    {teams.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-medium text-muted-foreground">Project</p>
                <Select
                  value={projectFilter}
                  onValueChange={(v) => setProjectFilter(v as any)}
                  disabled={teamFilter === 'all'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={teamFilter === 'all' ? 'Select a team first' : 'All projects'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All projects</SelectItem>
                    {filteredProjects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => d && setSelectedDate(d)}
            month={month}
            onMonthChange={setMonth}
            className="p-3 pointer-events-auto"
            modifiers={{ hasTasks: datesWithTasks }}
            modifiersClassNames={{ hasTasks: 'font-bold text-primary' }}
          />

          <div className="mt-4 px-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {format(selectedDate, 'EEEE, MMMM d')}
            </p>
            <p className="text-sm text-muted-foreground">
              {tasksForDate.length} task{tasksForDate.length !== 1 ? 's' : ''} due
            </p>
          </div>
        </div>

        {/* Right: Tasks for selected date */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="month">
              <h3 className="text-sm font-bold text-foreground mb-4">
                Tasks due {format(selectedDate, 'PPP')}
              </h3>

              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : tasksForDate.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="rounded-2xl bg-accent p-5">
                    <CalendarDays size={32} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No tasks due on this date</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasksForDate.map(task => {
                    const config = statusConfig[task.status];
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-card hover:shadow-sm"
                      >
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${config.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                          {config.label}
                        </span>
                        <span className="flex-1 text-sm font-medium text-foreground">{task.title}</span>
                        {task.project_name && (
                          <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                            {task.project_name}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* All upcoming tasks */}
              {!loading && tasks.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-bold text-foreground mb-4">All Upcoming Tasks</h3>
                  <div className="space-y-2">
                    {tasks.map(task => {
                      const config = statusConfig[task.status];
                      const isSelected = task.due_date && isSameDay(parseISO(task.due_date), selectedDate);
                      return (
                        <div
                          key={task.id}
                          className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-card hover:shadow-sm ${
                            isSelected ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
                          }`}
                        >
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${config.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                            {config.label}
                          </span>
                          <span className="flex-1 text-sm font-medium text-foreground">{task.title}</span>
                          {task.project_name && (
                            <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                              {task.project_name}
                            </span>
                          )}
                          <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                            {task.due_date && format(parseISO(task.due_date), 'MMM d')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="timeline">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="rounded-2xl bg-accent p-5">
                    <CalendarDays size={32} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No tasks to show</p>
                </div>
              ) : (
                <TaskTimeline
                  tasks={tasks}
                  sections={timelineSections}
                  rangeStart={startOfMonth(month)}
                  rangeEnd={endOfMonth(month)}
                  selectedDate={selectedDate}
                  onUpdateStartDate={updateStartDate}
                  onUpdateDueDate={updateDueDate}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
