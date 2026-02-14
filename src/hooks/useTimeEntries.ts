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

export const useTimeEntries = (projectId: string | null) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimeEntry[]>([]);

  const fetch = useCallback(async () => {
    if (!projectId || !user) return;
    const { data } = await supabase
      .from('time_entries')
      .select('*')
      .eq('task_id', projectId); // we'll filter by task in the component
    // Actually we need all entries for tasks in this project - let's just fetch per-task on demand
  }, [projectId, user]);

  const logTime = async (taskId: string, minutes: number) => {
    if (!user) return;
    const { error } = await supabase
      .from('time_entries')
      .insert({ task_id: taskId, user_id: user.id, minutes });
    if (error) throw error;
  };

  return { logTime };
};
