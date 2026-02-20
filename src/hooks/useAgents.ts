import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Agent {
  id: string;
  owner_id: string;
  display_name: string;
  email: string | null;
  project_id: string;
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
    const { data, error } = await supabase
      .from('agents' as any)
      .select('id, owner_id, display_name, email, project_id, key_prefix, created_at')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setAgents(data as unknown as Agent[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const createAgent = useCallback(async (
    displayName: string,
    projectId: string,
    email?: string
  ): Promise<CreateAgentResult> => {
    if (!user) throw new Error('Not authenticated');

    // Generate raw key client-side: ak_ + 32 random bytes hex
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const rawKey = 'ak_' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');

    // Hash with SHA-256
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rawKey));
    const keyHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    const keyPrefix = rawKey.substring(0, 10) + '...';

    const insertData: Record<string, string> = {
      owner_id: user.id,
      display_name: displayName,
      project_id: projectId,
      key_hash: keyHash,
      key_prefix: keyPrefix,
    };
    if (email) insertData.email = email;

    const { data, error } = await supabase
      .from('agents' as any)
      .insert(insertData)
      .select('id, owner_id, display_name, email, project_id, key_prefix, created_at')
      .single();

    if (error) throw error;
    const agent = data as unknown as Agent;
    setAgents(prev => [agent, ...prev]);
    return { agent, rawKey };
  }, [user]);

  const deleteAgent = useCallback(async (agentId: string) => {
    const { error } = await supabase
      .from('agents' as any)
      .delete()
      .eq('id', agentId);
    if (error) throw error;
    setAgents(prev => prev.filter(a => a.id !== agentId));
  }, []);

  return { agents, loading, createAgent, deleteAgent, refresh: fetchAgents };
}
