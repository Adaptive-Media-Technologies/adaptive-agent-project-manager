import { useState, useEffect } from 'react';
import { Task } from '@/hooks/useTasks';
import { useNotes } from '@/hooks/useNotes';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Circle, PlayCircle, Check, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const statusConfig = {
  open: { icon: Circle, label: 'Open', className: 'text-muted-foreground' },
  in_progress: { icon: PlayCircle, label: 'In Progress', className: 'text-primary' },
  complete: { icon: Check, label: 'Done', className: 'text-green-600' },
};

type Profile = { id: string; display_name: string | null; avatar_url: string | null };

type Props = {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalMinutes: number;
};

const TaskDetailDialog = ({ task, open, onOpenChange, totalMinutes }: Props) => {
  const { notes, loading, addNote, deleteNote } = useNotes(open ? task.id : null);
  const [newNote, setNewNote] = useState('');
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  // Fetch profiles for note authors
  useEffect(() => {
    if (!notes.length) return;
    const userIds = [...new Set(notes.map(n => n.user_id))];
    const missing = userIds.filter(id => !profiles[id]);
    if (!missing.length) return;
    supabase.from('profiles').select('id, display_name, avatar_url').in('id', missing)
      .then(({ data }) => {
        if (data) {
          setProfiles(prev => {
            const next = { ...prev };
            data.forEach((p: Profile) => { next[p.id] = p; });
            return next;
          });
        }
      });
  }, [notes]);

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

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-lg">{task.title}</SheetTitle>
          <SheetDescription>Task details & notes</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Status & Time */}
          <div className="flex items-center gap-4 text-sm">
            <div className={`flex items-center gap-1.5 ${className}`}>
              <StatusIcon size={16} />
              <span className="font-medium">{label}</span>
            </div>
            <span className="text-muted-foreground">Time: <span className="font-bold text-foreground">{timeDisplay}</span></span>
          </div>

          {/* Dates */}
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <span>Created: {format(new Date(task.created_at), 'PPp')}</span>
            {task.completed_at && <span>Completed: {format(new Date(task.completed_at), 'PPp')}</span>}
          </div>

          {/* Notes */}
          <div>
            <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</p>
            <form onSubmit={handleAddNote} className="mb-4 flex gap-2">
              <Input
                placeholder="Add a note..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="text-sm"
              />
              <Button type="submit" size="icon" variant="ghost" className="shrink-0">
                <Plus size={16} />
              </Button>
            </form>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            ) : (
              <div className="space-y-3">
                {notes.map(note => {
                  const profile = profiles[note.user_id];
                  return (
                    <div key={note.id} className="group flex items-start gap-3 rounded-lg border border-border p-3">
                      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                        {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
                        <AvatarFallback className="text-[10px]">{getInitials(profile?.display_name ?? null)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-foreground">{profile?.display_name ?? 'Unknown'}</span>
                          <span className="text-[10px] text-muted-foreground">{format(new Date(note.created_at), 'PP p')}</span>
                        </div>
                        <p className="text-sm text-foreground">{note.content}</p>
                      </div>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TaskDetailDialog;
