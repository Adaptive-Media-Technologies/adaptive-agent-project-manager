import { Task } from '@/hooks/useTasks';
import { Trash2, GripVertical, Timer, MoreHorizontal, CalendarDays, Bot } from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const statusConfig = {
  open: {
    label: 'Open',
    dot: 'bg-[hsl(var(--status-open))]',
    text: 'text-[hsl(var(--status-open))]',
  },
  in_progress: {
    label: 'In Progress',
    dot: 'bg-[hsl(var(--status-progress))]',
    text: 'text-[hsl(var(--status-progress))]',
  },
  complete: {
    label: 'Done',
    dot: 'bg-[hsl(var(--status-done))]',
    text: 'text-[hsl(var(--status-done))]',
  },
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
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 border-b border-border/50 px-1 py-3 transition-all last:border-0 ${
        isTimerActive
          ? 'bg-[hsl(var(--timer-active)/0.06)]'
          : 'hover:bg-accent/40'
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60 active:cursor-grabbing"
        title="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>

      {/* Status dot — click to cycle */}
      <button
        onClick={onCycle}
        title="Cycle status"
        className="shrink-0 flex items-center justify-center"
      >
        <span className={`h-3 w-3 rounded-full transition-transform hover:scale-125 ${config.dot} ${isTimerActive ? 'ring-2 ring-[hsl(var(--timer-active))] ring-offset-1 ring-offset-background' : ''}`} />
      </button>

      {/* Task title */}
      <span className={`flex-1 text-sm font-medium truncate ${task.status === 'complete' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
        {task.title}
      </span>

      {/* Right-side metadata */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Agent badge — purple, matching mockup */}
        <span className="hidden group-hover:inline-flex md:inline-flex items-center gap-1 text-[11px] font-medium text-[hsl(var(--sidebar-panel-active))] opacity-70">
          <Bot size={11} />
          Agent
        </span>

        {/* Time logged */}
        {totalMinutes > 0 && (
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground tabular-nums">
            {totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes}m`}
          </span>
        )}

        {/* Due date */}
        {task.due_date && (
          <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums ${
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

        {/* Status label */}
        <span className={`text-xs font-medium w-[72px] text-right ${config.text}`}>
          {config.label}
        </span>

        {/* Timer */}
        <button
          onClick={onStartTimer}
          className={`transition-opacity ${
            isTimerActive
              ? 'text-[hsl(var(--timer-active))]'
              : 'text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground'
          }`}
          title="Timer"
        >
          <Timer size={14} />
        </button>

        {/* Detail */}
        <button
          onClick={onOpenDetail}
          className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
          title="Details"
        >
          <MoreHorizontal size={14} />
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
