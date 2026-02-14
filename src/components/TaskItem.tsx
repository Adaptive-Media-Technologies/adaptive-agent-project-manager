import { Task } from '@/hooks/useTasks';
import { Check, Circle, Loader2, Trash2 } from 'lucide-react';

const statusConfig = {
  open: { icon: Circle, label: 'Open', className: 'text-muted-foreground' },
  in_progress: { icon: Loader2, label: 'In Progress', className: 'text-primary' },
  complete: { icon: Check, label: 'Done', className: 'text-green-600' },
};

type Props = {
  task: Task;
  onCycle: () => void;
  onDelete: () => void;
};

const TaskItem = ({ task, onCycle, onDelete }: Props) => {
  const { icon: Icon, className } = statusConfig[task.status];

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 transition-colors hover:bg-accent">
      <button onClick={onCycle} className={`shrink-0 ${className}`} title="Cycle status">
        <Icon size={18} />
      </button>
      <span className={`flex-1 text-sm ${task.status === 'complete' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
        {task.title}
      </span>
      <button onClick={onDelete} className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive">
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default TaskItem;
