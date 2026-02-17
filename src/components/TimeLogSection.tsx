import { useState } from 'react';
import { TimeEntry, useTaskTimeEntries } from '@/hooks/useTimeEntries';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Plus, Trash2, Check, X, Pencil } from 'lucide-react';
import { toast } from 'sonner';

type Profile = { id: string; display_name: string | null; avatar_url: string | null };

type Props = {
  taskId: string;
};

const TimeLogSection = ({ taskId }: Props) => {
  const { entries, loading, addEntry, updateEntry, deleteEntry } = useTaskTimeEntries(taskId);
  const [newMinutes, setNewMinutes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  useEffect(() => {
    if (!entries.length) return;
    const userIds = [...new Set(entries.map(e => e.user_id))];
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
  }, [entries]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(newMinutes);
    if (!mins || mins <= 0) return;
    try {
      await addEntry(mins);
      setNewMinutes('');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSaveEdit = async (id: string) => {
    const mins = parseInt(editValue);
    if (!mins || mins <= 0) { setEditingId(null); return; }
    try {
      await updateEntry(id, mins);
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatMins = (m: number) => {
    const hrs = Math.floor(m / 60);
    const mins = m % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <div>
      <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Time Log</p>
      <form onSubmit={handleAdd} className="mb-4 flex gap-2 items-center">
        <Input
          type="number"
          min={1}
          placeholder="Minutes"
          value={newMinutes}
          onChange={e => setNewMinutes(e.target.value)}
          className="text-sm w-24"
        />
        <span className="text-xs text-muted-foreground">min</span>
        <Button type="submit" size="icon" variant="ghost" className="shrink-0">
          <Plus size={16} />
        </Button>
      </form>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No time logged yet.</p>
      ) : (
        <div className="space-y-2">
          {entries.map(entry => {
            const profile = profiles[entry.user_id];
            const isEditing = editingId === entry.id;
            return (
              <div key={entry.id} className="group flex items-center gap-3 rounded-lg border border-border p-2.5">
                <Avatar className="h-7 w-7 shrink-0">
                  {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
                  <AvatarFallback className="text-[10px]">{getInitials(profile?.display_name ?? null)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{profile?.display_name ?? 'Unknown'}</span>
                  {isEditing ? (
                    <span className="flex items-center gap-1">
                      <Input
                        type="number"
                        min={1}
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        autoFocus
                        className="h-6 w-16 text-xs"
                        onKeyDown={e => { if (e.key === 'Escape') setEditingId(null); }}
                      />
                      <span className="text-[10px] text-muted-foreground">min</span>
                      <button onClick={() => handleSaveEdit(entry.id)} className="text-foreground hover:text-primary"><Check size={12} /></button>
                      <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground"><X size={12} /></button>
                    </span>
                  ) : (
                    <button
                      onClick={() => { setEditingId(entry.id); setEditValue(String(entry.minutes)); }}
                      className="text-sm font-bold text-foreground hover:text-primary flex items-center gap-1"
                    >
                      {formatMins(entry.minutes)}
                      <Pencil size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{format(new Date(entry.created_at), 'PP')}</span>
                <button
                  onClick={async () => { try { await deleteEntry(entry.id); } catch (err: any) { toast.error(err.message); } }}
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
  );
};

export default TimeLogSection;
