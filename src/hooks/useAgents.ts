import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Agent {
  id: string;
  owner_id: string;
  display_name: string;
  email: string | null;
  project_ids: string[];
  key_prefix: string;
  created_at: string;
}

export interface CreateAgentResult {
  agent: Agent;
  rawKey: string;
}

export function useAgents() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAgents = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Fetch agents
    // Fetch all agents visible to the user (owned + team-shared via RLS)
    const { data: agentRows, error } = await supabase
      .from('agents' as any)
      .select('id, owner_id, display_name, email, key_prefix, created_at')
      .order('created_at', { ascending: false });

    if (error || !agentRows) {
      setLoading(false);
      return;
    }

    // Fetch all project assignments for these agents
    const agentIds = (agentRows as any[]).map((a: any) => a.id);
    let assignmentMap: Record<string, string[]> = {};

    if (agentIds.length > 0) {
      const { data: assignments } = await supabase
        .from('agent_projects' as any)
        .select('agent_id, project_id')
        .in('agent_id', agentIds);

      if (assignments) {
        for (const row of assignments as any[]) {
          if (!assignmentMap[row.agent_id]) assignmentMap[row.agent_id] = [];
          assignmentMap[row.agent_id].push(row.project_id);
        }
      }
    }

    const mapped: Agent[] = (agentRows as any[]).map((a: any) => ({
      ...a,
      project_ids: assignmentMap[a.id] || [],
    }));

    setAgents(mapped);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const createAgent = useCallback(async (
    displayName: string,
    projectIds: string[],
    email?: string
  ): Promise<CreateAgentResult> => {
    if (!user) throw new Error('Not authenticated');

    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const rawKey = 'ak_' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');

    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rawKey));
    const keyHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    const keyPrefix = rawKey.substring(0, 10) + '...';

    const insertData: Record<string, string> = {
      owner_id: user.id,
      display_name: displayName,
      key_hash: keyHash,
      key_prefix: keyPrefix,
    };
    if (email) insertData.email = email;

    const { data, error } = await supabase
      .from('agents' as any)
      .insert(insertData)
      .select('id, owner_id, display_name, email, key_prefix, created_at')
      .single();

    if (error) throw error;

    // Insert project assignments
    if (projectIds.length > 0) {
      const assignments = projectIds.map(pid => ({
        agent_id: (data as any).id,
        project_id: pid,
      }));
      const { error: assignError } = await supabase
        .from('agent_projects' as any)
        .insert(assignments);
      if (assignError) throw assignError;
    }

    const agent: Agent = {
      ...(data as any),
      project_ids: projectIds,
    };
    setAgents(prev => [agent, ...prev]);
    return { agent, rawKey };
  }, [user]);

  const updateAgentProjects = useCallback(async (agentId: string, projectIds: string[]) => {
    // Delete all existing assignments, then insert new ones
    const { error: delError } = await supabase
      .from('agent_projects' as any)
      .delete()
      .eq('agent_id', agentId);
    if (delError) throw delError;

    if (projectIds.length > 0) {
      const assignments = projectIds.map(pid => ({
        agent_id: agentId,
        project_id: pid,
      }));
      const { error: insError } = await supabase
        .from('agent_projects' as any)
        .insert(assignments);
      if (insError) throw insError;
    }

    setAgents(prev => prev.map(a =>
      a.id === agentId ? { ...a, project_ids: projectIds } : a
    ));
  }, []);

  const deleteAgent = useCallback(async (agentId: string) => {
    const { error } = await supabase
      .from('agents' as any)
      .delete()
      .eq('id', agentId);
    if (error) throw error;
    setAgents(prev => prev.filter(a => a.id !== agentId));
  }, []);

  return { agents, loading, createAgent, deleteAgent, updateAgentProjects, refresh: fetchAgents };
}
