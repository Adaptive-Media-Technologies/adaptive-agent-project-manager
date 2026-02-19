import { Task } from '@/hooks/useTasks';
import { Check, Circle, PlayCircle, Trash2, GripVertical, Timer, MoreHorizontal, CalendarDays } from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const statusConfig = {
  open: { label: 'Open', dot: 'bg-[hsl(var(--status-open))]', border: 'border-l-[hsl(var(--status-open)/0.3)]', badge: 'bg-[hsl(var(--status-open)/0.1)] text-[hsl(var(--status-open))]' },
  in_progress: { label: 'In Progress', dot: 'bg-[hsl(var(--status-progress))]', border: 'border-l-[hsl(var(--status-progress))]', badge: 'bg-[hsl(var(--status-progress)/0.1)] text-[hsl(var(--status-progress))]' },
  complete: { label: 'Done', dot: 'bg-[hsl(var(--status-done))]', border: 'border-l-[hsl(var(--status-done))]', badge: 'bg-[hsl(var(--status-done)/0.1)] text-[hsl(var(--status-done))]' },
};

type Props = {
  task: Task;
  onCycle: () => void;
  onDelete: () => void;
  onStartTimer?: () => void;
  isTimerActive?: boolean;
  totalMinutes?: number;
  onOpenDetail?: () => void;
};

const TaskItem = ({ task, onCycle, onDelete, onStartTimer, isTimerActive, totalMinutes = 0, onOpenDetail }: Props) => {
  const config = statusConfig[task.status];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2.5 rounded-xl border border-l-[3px] ${config.border} px-3 py-3 transition-card ${
        isTimerActive
          ? 'border-[hsl(var(--timer-active))] border-l-[hsl(var(--timer-active))] bg-[hsl(var(--timer-active)/0.08)] shadow-sm'
          : 'border-border bg-card hover:bg-accent/50 hover:shadow-sm'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab text-muted-foreground opacity-30 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        title="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>

      <button onClick={onCycle} className="shrink-0" title="Cycle status">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${config.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
          {config.label}
        </span>
      </button>

      <span className={`flex-1 text-sm font-medium ${task.status === 'complete' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
        {task.title}
      </span>

      {totalMinutes > 0 && (
        <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground tabular-nums">
          {totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes}m`}
        </span>
      )}

      {task.due_date && (
        <span className={`shrink-0 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums ${
          task.status === 'complete'
            ? 'bg-muted text-muted-foreground'
            : isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date))
              ? 'bg-destructive/10 text-destructive'
              : isToday(parseISO(task.due_date))
                ? 'bg-[hsl(var(--status-progress)/0.1)] text-[hsl(var(--status-progress))]'
                : 'bg-muted text-muted-foreground'
        }`}>
          <CalendarDays size={10} />
          {format(parseISO(task.due_date), 'MMM d')}
        </span>
      )}

      <button
        onClick={onStartTimer}
        className={`shrink-0 transition-opacity ${
          isTimerActive
            ? 'text-[hsl(var(--timer-active))]'
            : 'text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground'
        }`}
        title="Timer"
      >
        <Timer size={14} />
      </button>

      <button
        onClick={onOpenDetail}
        className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
        title="Details"
      >
        <MoreHorizontal size={14} />
      </button>

      <button onClick={onDelete} className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive">
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default TaskItem;
