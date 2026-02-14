import { Task } from '@/hooks/useTasks';
import { Check, Circle, Loader2, Trash2, GripVertical, Timer } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const statusConfig = {
  open: { icon: Circle, label: 'Open', className: 'text-muted-foreground' },
  in_progress: { icon: Loader2, label: 'Doing', className: 'text-primary' },
  complete: { icon: Check, label: 'Done', className: 'text-green-600' },
};

type Props = {
  task: Task;
  onCycle: () => void;
  onDelete: () => void;
  onStartTimer?: () => void;
  isTimerActive?: boolean;
};

const TaskItem = ({ task, onCycle, onDelete, onStartTimer, isTimerActive }: Props) => {
  const { icon: Icon, label, className } = statusConfig[task.status];

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
      className={`group flex items-center gap-2 rounded-lg border px-2 py-2 transition-colors ${
        isTimerActive
          ? 'border-[hsl(var(--timer-active))] bg-[hsl(var(--timer-active)/0.1)]'
          : 'border-border bg-card hover:bg-accent'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        title="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>

      <button onClick={onCycle} className={`shrink-0 flex items-center gap-1.5 ${className}`} title="Cycle status">
        <Icon size={16} />
        <span className="text-xs font-medium">{label}</span>
      </button>

      <span className={`flex-1 text-sm ${task.status === 'complete' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
        {task.title}
      </span>

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

      <button onClick={onDelete} className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive">
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default TaskItem;
