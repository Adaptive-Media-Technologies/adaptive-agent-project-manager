import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/hooks/useTasks';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { Circle, PlayCircle, Check, CalendarDays } from 'lucide-react';

const statusConfig = {
  open: { label: 'Open', dot: 'bg-[hsl(var(--status-open))]', badge: 'bg-[hsl(var(--status-open)/0.1)] text-[hsl(var(--status-open))]' },
  in_progress: { label: 'In Progress', dot: 'bg-[hsl(var(--status-progress))]', badge: 'bg-[hsl(var(--status-progress)/0.1)] text-[hsl(var(--status-progress))]' },
  complete: { label: 'Done', dot: 'bg-[hsl(var(--status-done))]', badge: 'bg-[hsl(var(--status-done)/0.1)] text-[hsl(var(--status-done))]' },
};

type TaskWithProject = Task & { project_name?: string };

const CalendarView = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('tasks')
      .select('*, projects(name)')
      .not('due_date', 'is', null)
      .in('status', ['open', 'in_progress'])
      .order('due_date');
    
    const mapped = (data || []).map((t: any) => ({
      ...t,
      status: t.status as Task['status'],
      project_name: t.projects?.name,
    }));
    setTasks(mapped);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const tasksForDate = selectedDate
    ? tasks.filter(t => t.due_date && isSameDay(parseISO(t.due_date), selectedDate))
    : [];

  const datesWithTasks = tasks
    .filter(t => t.due_date)
    .map(t => parseISO(t.due_date!));

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center gap-3 border-b border-border bg-card/80 backdrop-blur-sm px-6 py-3 shadow-sm">
        <CalendarDays size={20} className="text-primary" />
        <h2 className="text-lg font-bold text-foreground">Calendar</h2>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Calendar */}
        <div className="w-[340px] shrink-0 border-r border-border bg-card p-4 overflow-y-auto">
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
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
