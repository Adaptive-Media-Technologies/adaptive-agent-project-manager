import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useProjectNotes = (projectId: string | null) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetch = useCallback(async () => {
    if (!projectId) { setContent(''); return; }
    setLoading(true);
    const { data } = await supabase
      .from('project_notes')
      .select('content')
      .eq('project_id', projectId)
      .maybeSingle();
    setContent(data?.content ?? '');
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

  return { content, loading, save };
};
