import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type TimeEntry = {
  id: string;
  task_id: string;
  user_id: string;
  minutes: number;
  created_at: string;
};

export const useTaskTimeEntries = (taskId: string | null) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!taskId || !user) { setEntries([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('time_entries')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });
    setEntries((data as TimeEntry[]) || []);
    setLoading(false);
  }, [taskId, user]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const addEntry = async (minutes: number) => {
    if (!user || !taskId) return;
    const { data, error } = await supabase
      .from('time_entries')
      .insert({ task_id: taskId, user_id: user.id, minutes })
      .select()
      .single();
    if (error) throw error;
    setEntries(prev => [data as TimeEntry, ...prev]);
  };

  const updateEntry = async (id: string, minutes: number) => {
    const { error } = await supabase
      .from('time_entries')
      .update({ minutes })
      .eq('id', id);
    if (error) throw error;
    setEntries(prev => prev.map(e => e.id === id ? { ...e, minutes } : e));
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', id);
    if (error) throw error;
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  return { entries, loading, addEntry, updateEntry, deleteEntry, refresh: fetchEntries };
};

export const useTimeEntries = (projectId: string | null) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!projectId || !user) { setEntries([]); return; }
    setLoading(true);
    // Get all task IDs for this project, then fetch their time entries
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('project_id', projectId);
    if (!tasks || tasks.length === 0) { setEntries([]); setLoading(false); return; }
    const taskIds = tasks.map(t => t.id);
    const { data } = await supabase
      .from('time_entries')
      .select('*')
      .in('task_id', taskIds);
    setEntries((data as TimeEntry[]) || []);
    setLoading(false);
  }, [projectId, user]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  // Aggregate minutes per task
  const taskMinutes: Record<string, number> = {};
  entries.forEach(e => {
    taskMinutes[e.task_id] = (taskMinutes[e.task_id] || 0) + e.minutes;
  });

  const logTime = async (taskId: string, minutes: number) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('time_entries')
      .insert({ task_id: taskId, user_id: user.id, minutes })
      .select()
      .single();
    if (error) throw error;
    setEntries(prev => [...prev, data as TimeEntry]);
  };

  return { entries, taskMinutes, logTime, loading, refresh: fetchEntries };
};
