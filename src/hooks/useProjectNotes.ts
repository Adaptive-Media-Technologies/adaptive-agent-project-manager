import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const NOTE_COLORS = [
  { name: 'Default', value: '', bg: 'bg-card', border: 'border-border' },
  { name: 'Red', value: 'red', bg: 'bg-red-950/40', border: 'border-red-900/50' },
  { name: 'Orange', value: 'orange', bg: 'bg-orange-950/40', border: 'border-orange-900/50' },
  { name: 'Yellow', value: 'yellow', bg: 'bg-yellow-950/40', border: 'border-yellow-900/50' },
  { name: 'Green', value: 'green', bg: 'bg-green-950/40', border: 'border-green-900/50' },
  { name: 'Teal', value: 'teal', bg: 'bg-teal-950/40', border: 'border-teal-900/50' },
  { name: 'Blue', value: 'blue', bg: 'bg-blue-950/40', border: 'border-blue-900/50' },
  { name: 'Purple', value: 'purple', bg: 'bg-purple-950/40', border: 'border-purple-900/50' },
  { name: 'Pink', value: 'pink', bg: 'bg-pink-950/40', border: 'border-pink-900/50' },
] as const;

export type NoteColor = typeof NOTE_COLORS[number]['value'];

export const getNoteClasses = (color: NoteColor) => {
  const c = NOTE_COLORS.find(n => n.value === color) ?? NOTE_COLORS[0];
  return `${c.bg} ${c.border}`;
};

export const useProjectNotes = (projectId: string | null) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [color, setColorState] = useState<NoteColor>('');
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetch = useCallback(async () => {
    if (!projectId) { setContent(''); setColorState(''); return; }
    setLoading(true);
    const { data } = await supabase
      .from('project_notes')
      .select('content, color')
      .eq('project_id', projectId)
      .maybeSingle();
    setContent(data?.content ?? '');
    setColorState((data?.color ?? '') as NoteColor);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetch(); }, [fetch]);

  const save = useCallback(async (text: string) => {
    if (!user || !projectId) return;
    setContent(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      await supabase.from('project_notes').upsert(
        { project_id: projectId, content: text, updated_by: user.id },
        { onConflict: 'project_id' }
      );
    }, 600);
  }, [user, projectId]);

  const setColor = useCallback(async (c: NoteColor) => {
    if (!user || !projectId) return;
    setColorState(c);
    await supabase.from('project_notes').upsert(
      { project_id: projectId, content, color: c, updated_by: user.id },
      { onConflict: 'project_id' }
    );
  }, [user, projectId, content]);

  return { content, color, loading, save, setColor };
};
