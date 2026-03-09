import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type TaskGroup = {
  id: string;
  project_id: string;
  name: string;
  position: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
};

export const useTaskGroups = (projectId: string | null) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<TaskGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user || !projectId) {
      setGroups([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('task_groups')
      .select('*')
      .eq('project_id', projectId)
      .order('position')
      .order('created_at');
    if (error) console.error('[useTaskGroups] fetch error:', error);
    setGroups((data as TaskGroup[]) || []);
    setLoading(false);
  }, [user, projectId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const createGroup = async (name: string) => {
    if (!user || !projectId) return;
    const position = groups.length;
    const { data, error } = await supabase
      .from('task_groups')
      .insert({ project_id: projectId, name, position } as any)
      .select()
      .single();
    if (error) throw error;
    setGroups((prev) => [...prev, data as TaskGroup]);
    return data as TaskGroup;
  };

  const renameGroup = async (id: string, name: string) => {
    const { error } = await supabase.from('task_groups').update({ name }).eq('id', id);
    if (error) throw error;
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, name } : g)));
  };

  const updateGroupDates = async (id: string, startDate: string | null, endDate: string | null) => {
    const { error } = await supabase
      .from('task_groups')
      .update({ start_date: startDate, end_date: endDate } as any)
      .eq('id', id);
    if (error) throw error;
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, start_date: startDate, end_date: endDate } : g))
    );
  };

  const deleteGroup = async (id: string) => {
    // Tasks will be moved to Ungrouped via FK ON DELETE SET NULL.
    const { error } = await supabase.from('task_groups').delete().eq('id', id);
    if (error) throw error;
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const reorderGroups = async (fromIndex: number, toIndex: number) => {
    const updated = [...groups];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    const reordered = updated.map((g, idx) => ({ ...g, position: idx }));
    setGroups(reordered);
    await Promise.all(
      reordered.map((g) => supabase.from('task_groups').update({ position: g.position }).eq('id', g.id))
    );
  };

  return {
    groups,
    loading,
    createGroup,
    renameGroup,
    updateGroupDates,
    deleteGroup,
    reorderGroups,
    refresh: fetch,
  };
};

