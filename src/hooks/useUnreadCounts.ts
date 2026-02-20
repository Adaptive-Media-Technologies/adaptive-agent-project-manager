import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/**
 * Tracks unread message counts per project by comparing project_messages.created_at
 * against a per-user last_read_at timestamp stored in project_last_read.
 */
export function useUnreadCounts(projectIds: string[]) {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Record<string, number>>({});
  // Track last-read timestamps per project (used to filter realtime inserts)
  const lastReadRef = useRef<Record<string, string>>({});

  const fetchCounts = useCallback(async () => {
    if (!user || projectIds.length === 0) { setCounts({}); return; }

    // 1. Get last_read_at for all projects for this user
    const { data: readRows } = await supabase
      .from('project_last_read' as any)
      .select('project_id, last_read_at')
      .eq('user_id', user.id)
      .in('project_id', projectIds) as any;

    const readMap: Record<string, string> = {};
    for (const r of readRows || []) {
      readMap[r.project_id] = r.last_read_at;
    }
    lastReadRef.current = readMap;

    // 2. For each project, count messages newer than last_read_at
    const newCounts: Record<string, number> = {};
    await Promise.all(
      projectIds.map(async (pid) => {
        const since = readMap[pid];
        let query = supabase
          .from('project_messages' as any)
          .select('id', { count: 'exact', head: true })
          .eq('project_id', pid)
          .neq('user_id', user.id) as any; // don't count own messages

        if (since) {
          query = query.gt('created_at', since);
        }
        const { count } = await query;
        if (count && count > 0) newCounts[pid] = count;
      })
    );

    setCounts(newCounts);
  }, [user, projectIds.join(',')]); // eslint-disable-line

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Realtime: listen to new messages across all subscribed projects
  useEffect(() => {
    if (!user || projectIds.length === 0) return;

    const channel = supabase
      .channel('unread-counts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'project_messages',
      }, (payload: any) => {
        const msg = payload.new as any;
        // Ignore own messages
        if (msg.user_id === user.id) return;
        // Only track if this project is in our list
        if (!projectIds.includes(msg.project_id)) return;

        setCounts(prev => ({
          ...prev,
          [msg.project_id]: (prev[msg.project_id] || 0) + 1,
        }));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, projectIds.join(',')]); // eslint-disable-line

  const markRead = useCallback(async (projectId: string) => {
    if (!user) return;
    const now = new Date().toISOString();

    // Upsert last_read_at
    await (supabase.from('project_last_read' as any).upsert({
      user_id: user.id,
      project_id: projectId,
      last_read_at: now,
    }, { onConflict: 'user_id,project_id' }) as any);

    lastReadRef.current[projectId] = now;
    // Clear unread count for this project
    setCounts(prev => {
      if (!prev[projectId]) return prev;
      const next = { ...prev };
      delete next[projectId];
      return next;
    });
  }, [user]);

  const totalUnread = Object.values(counts).reduce((a, b) => a + b, 0);

  return { counts, totalUnread, markRead };
}
