import { useState } from 'react';
import { Task } from '@/hooks/useTasks';
import { Check, Circle, Loader2, Trash2, GripVertical, Clock } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';

const statusConfig = {
  open: { icon: Circle, label: 'Open', className: 'text-muted-foreground' },
  in_progress: { icon: Loader2, label: 'Doing', className: 'text-primary' },
  complete: { icon: Check, label: 'Done', className: 'text-green-600' },
};

type Props = {
  task: Task;
  onCycle: () => void;
  onDelete: () => void;
  onLogTime?: (minutes: number) => void;
};

const TaskItem = ({ task, onCycle, onDelete, onLogTime }: Props) => {
  const { icon: Icon, label, className } = statusConfig[task.status];
  const [showTime, setShowTime] = useState(false);
  const [minutes, setMinutes] = useState('');

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

  const handleLogTime = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(minutes, 10);
    if (val > 0 && onLogTime) {
      onLogTime(val);
      setMinutes('');
      setShowTime(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-2 transition-colors hover:bg-accent"
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

      {showTime ? (
        <form onSubmit={handleLogTime} className="flex items-center gap-1">
          <Input
            type="number"
            min={1}
            placeholder="min"
            value={minutes}
            onChange={e => setMinutes(e.target.value)}
            className="h-6 w-16 text-xs"
            autoFocus
            onBlur={() => { if (!minutes) setShowTime(false); }}
          />
        </form>
      ) : (
        <button
          onClick={() => setShowTime(true)}
          className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
          title="Log time"
        >
          <Clock size={14} />
        </button>
      )}

      <button onClick={onDelete} className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive">
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default TaskItem;
