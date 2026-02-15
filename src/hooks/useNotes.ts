import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type Note = {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export const useNotes = (taskId: string | null) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!taskId) { setNotes([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });
    setNotes((data as Note[]) || []);
    setLoading(false);
  }, [taskId]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const addNote = async (content: string) => {
    if (!user || !taskId) return;
    const { data, error } = await supabase
      .from('notes')
      .insert({ task_id: taskId, user_id: user.id, content })
      .select()
      .single();
    if (error) throw error;
    setNotes(n => [data as Note, ...n]);
  };

  const deleteNote = async (id: string) => {
    setNotes(n => n.filter(note => note.id !== id));
    await supabase.from('notes').delete().eq('id', id);
  };

  return { notes, loading, addNote, deleteNote, refresh: fetchNotes };
};
