import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const NOTE_COLORS = [
  { name: 'Default', value: '', gradient: 'bg-card', border: 'border-border', text: 'text-foreground', placeholder: 'placeholder:text-muted-foreground', swatch: 'bg-card border-border' },
  { name: 'Sunset', value: 'sunset', gradient: 'bg-gradient-to-br from-rose-500/25 via-orange-500/20 to-amber-400/15', border: 'border-rose-500/40', text: 'text-black', placeholder: 'placeholder:text-black/50', swatch: 'bg-gradient-to-br from-rose-500 to-amber-400' },
  { name: 'Ocean', value: 'ocean', gradient: 'bg-gradient-to-br from-cyan-500/25 via-blue-600/20 to-indigo-500/15', border: 'border-cyan-400/40', text: 'text-black', placeholder: 'placeholder:text-black/50', swatch: 'bg-gradient-to-br from-cyan-400 to-indigo-500' },
  { name: 'Forest', value: 'forest', gradient: 'bg-gradient-to-br from-emerald-500/25 via-green-600/20 to-teal-500/15', border: 'border-emerald-400/40', text: 'text-black', placeholder: 'placeholder:text-black/50', swatch: 'bg-gradient-to-br from-emerald-400 to-teal-500' },
  { name: 'Aurora', value: 'aurora', gradient: 'bg-gradient-to-br from-violet-500/25 via-purple-500/20 to-fuchsia-400/15', border: 'border-violet-400/40', text: 'text-black', placeholder: 'placeholder:text-black/50', swatch: 'bg-gradient-to-br from-violet-500 to-fuchsia-400' },
  { name: 'Ember', value: 'ember', gradient: 'bg-gradient-to-br from-red-600/25 via-rose-500/20 to-pink-500/15', border: 'border-red-500/40', text: 'text-black', placeholder: 'placeholder:text-black/50', swatch: 'bg-gradient-to-br from-red-500 to-pink-500' },
  { name: 'Gold', value: 'gold', gradient: 'bg-gradient-to-br from-yellow-500/25 via-amber-500/20 to-orange-400/15', border: 'border-yellow-500/40', text: 'text-black', placeholder: 'placeholder:text-black/50', swatch: 'bg-gradient-to-br from-yellow-400 to-orange-400' },
  { name: 'Storm', value: 'storm', gradient: 'bg-gradient-to-br from-slate-500/25 via-zinc-600/20 to-gray-500/15', border: 'border-slate-400/40', text: 'text-black', placeholder: 'placeholder:text-black/50', swatch: 'bg-gradient-to-br from-slate-400 to-gray-500' },
] as const;

export type NoteColor = typeof NOTE_COLORS[number]['value'];

export const getNoteColorConfig = (color: NoteColor) => {
  return NOTE_COLORS.find(n => n.value === color) ?? NOTE_COLORS[0];
};

export const getNoteClasses = (color: NoteColor) => {
  const c = getNoteColorConfig(color);
  return `${c.gradient} ${c.border}`;
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
