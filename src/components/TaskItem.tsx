import { Task } from '@/hooks/useTasks';
import { Archive, GripVertical, Timer, MoreHorizontal, CalendarDays, Bot, User } from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';

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
  assigneeName?: string | null;
  assigneeType?: 'user' | 'agent' | null;
  assigneeAvatarUrl?: string | null;
};

const TaskItem = ({ task, onCycle, onDelete, onStartTimer, isTimerActive, totalMinutes = 0, onOpenDetail, assigneeName, assigneeType, assigneeAvatarUrl }: Props) => {
  const config = statusConfig[task.status];
  const isMobile = useIsMobile();

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
      onClick={() => {
        if (isMobile) onOpenDetail?.();
      }}
      onKeyDown={(e) => {
        if (!isMobile) return;
        if (e.key === 'Enter' || e.key === ' ') onOpenDetail?.();
      }}
      role={isMobile ? 'button' : undefined}
      tabIndex={isMobile ? 0 : undefined}
      className={`group flex items-center gap-3 border-b border-border/50 px-1 py-3 transition-all last:border-0 ${
        isTimerActive
          ? 'bg-[hsl(var(--timer-active)/0.06)]'
          : 'hover:bg-accent/40'
      } ${isMobile ? 'cursor-pointer' : ''}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        type="button"
        onClick={(e) => e.stopPropagation()}
        className="hidden md:inline-flex shrink-0 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60 active:cursor-grabbing"
        title="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>

      {/* Status dot — click to cycle */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onCycle();
        }}
        title="Cycle status"
        className="shrink-0 flex items-center justify-center"
      >
        <span className={`h-3 w-3 rounded-full transition-transform hover:scale-125 ${config.dot} ${isTimerActive ? 'ring-2 ring-[hsl(var(--timer-active))] ring-offset-1 ring-offset-background' : ''}`} />
      </button>

      {/* Assignee avatar */}
      {assigneeName && assigneeType === 'agent' && (
        <Bot size={14} className="shrink-0 text-[hsl(var(--sidebar-panel-active))]" />
      )}
      {assigneeName && assigneeType === 'user' && (
        <Avatar className="h-5 w-5 shrink-0">
          {assigneeAvatarUrl && <AvatarImage src={assigneeAvatarUrl} />}
          <AvatarFallback className="text-[7px]">{assigneeName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}</AvatarFallback>
        </Avatar>
      )}

      <div className="min-w-0 flex-1">
        {/* Task title */}
        <div className={`text-sm font-medium truncate ${task.status === 'complete' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {task.title}
        </div>

        {/* Mobile meta line */}
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground md:hidden">
          <span className={`inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 font-medium ${config.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            {config.label}
          </span>

          {assigneeName && (
            <span className={`inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 font-medium opacity-80 ${
              assigneeType === 'agent' ? 'text-[hsl(var(--sidebar-panel-active))]' : 'text-muted-foreground'
            }`}>
              {assigneeType === 'agent' ? <Bot size={11} /> : <User size={11} />}
              {assigneeName}
            </span>
          )}

          {totalMinutes > 0 && (
            <span className="rounded-md bg-muted px-1.5 py-0.5 font-bold text-muted-foreground tabular-nums">
              {totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes}m`}
            </span>
          )}

          {task.due_date && (
            <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium tabular-nums ${
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
        </div>
      </div>

      {/* Right-side metadata */}
      <div className="hidden md:flex items-center gap-2.5 shrink-0">
        {/* Assignee label — always show */}
        {assigneeName && (
          <span className={`hidden group-hover:inline-flex md:inline-flex items-center gap-1 text-[11px] font-medium opacity-70 ${
            assigneeType === 'agent' ? 'text-[hsl(var(--sidebar-panel-active))]' : 'text-muted-foreground'
          }`}>
            {assigneeType === 'agent' ? <Bot size={11} /> : <User size={11} />}
            {assigneeName}
          </span>
        )}

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
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStartTimer?.();
          }}
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
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail?.();
          }}
          className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
          title="Details"
        >
          <MoreHorizontal size={14} />
        </button>

        {/* Archive */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-[hsl(var(--status-progress))]"
          title="Archive"
        >
          <Archive size={14} />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
