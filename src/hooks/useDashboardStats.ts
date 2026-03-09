import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type DashboardTask = {
  id: string;
  title: string;
  status: string;
  project_id: string;
  due_date: string | null;
  assigned_to: string | null;
  assigned_type: string | null;
};

export type DashboardMember = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  username: string | null;
};

export function useDashboardStats() {
  const { user } = useAuth();
  const [allTasks, setAllTasks] = useState<DashboardTask[]>([]);
  const [teamMembers, setTeamMembers] = useState<DashboardMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    const [tasksRes, membersRes] = await Promise.all([
      supabase
        .from('tasks')
        .select('id, title, status, project_id, due_date, assigned_to, assigned_type')
        .neq('status', 'archived'),
      supabase
        .from('team_members')
        .select('user_id, profiles:team_members_user_id_profiles_fkey(display_name, avatar_url, username)')
    ]);

    setAllTasks((tasksRes.data as DashboardTask[]) || []);

    // Deduplicate members by user_id
    const seen = new Set<string>();
    const members: DashboardMember[] = [];
    for (const row of (membersRes.data || []) as any[]) {
      if (!seen.has(row.user_id)) {
        seen.add(row.user_id);
        members.push({
          user_id: row.user_id,
          display_name: row.profiles?.display_name || null,
          avatar_url: row.profiles?.avatar_url || null,
          username: row.profiles?.username || null,
        });
      }
    }
    setTeamMembers(members);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  return { allTasks, teamMembers, loading, refresh: fetch };
}
