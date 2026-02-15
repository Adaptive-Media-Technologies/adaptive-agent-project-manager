import { useState } from 'react';
import { Task } from '@/hooks/useTasks';
import { useNotes } from '@/hooks/useNotes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Circle, Loader2, Check, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const statusConfig = {
  open: { icon: Circle, label: 'Open', className: 'text-muted-foreground' },
  in_progress: { icon: Loader2, label: 'Doing', className: 'text-primary' },
  complete: { icon: Check, label: 'Done', className: 'text-green-600' },
};

type Props = {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalMinutes: number;
};

const TaskDetailDialog = ({ task, open, onOpenChange, totalMinutes }: Props) => {
  const { notes, loading, addNote, deleteNote } = useNotes(open ? task.id : null);
  const [newNote, setNewNote] = useState('');

  const { icon: StatusIcon, label, className } = statusConfig[task.status];

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await addNote(newNote.trim());
      setNewNote('');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const timeDisplay = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">{task.title}</DialogTitle>
          <DialogDescription>Task details & notes</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status & Time */}
          <div className="flex items-center gap-4 text-sm">
            <div className={`flex items-center gap-1.5 ${className}`}>
              <StatusIcon size={14} />
              <span className="font-medium">{label}</span>
            </div>
            <span className="text-muted-foreground">Time: <span className="font-bold text-foreground">{timeDisplay}</span></span>
          </div>

          {/* Dates */}
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Created: {format(new Date(task.created_at), 'PPp')}</span>
            {task.completed_at && <span>Completed: {format(new Date(task.completed_at), 'PPp')}</span>}
          </div>

          {/* Notes */}
          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</p>
            <form onSubmit={handleAddNote} className="mb-3 flex gap-2">
              <Input
                placeholder="Add a note..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="h-8 text-sm"
              />
              <Button type="submit" size="icon" variant="ghost" className="h-8 w-8 shrink-0">
                <Plus size={14} />
              </Button>
            </form>
            {loading ? (
              <p className="text-xs text-muted-foreground">Loading...</p>
            ) : notes.length === 0 ? (
              <p className="text-xs text-muted-foreground">No notes yet.</p>
            ) : (
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {notes.map(note => (
                  <div key={note.id} className="group flex items-start gap-2 rounded-md border border-border px-3 py-2">
                    <p className="flex-1 text-sm text-foreground">{note.content}</p>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailDialog;
