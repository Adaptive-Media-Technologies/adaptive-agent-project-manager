import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type Team = {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: { display_name: string | null; avatar_url: string | null };
};

export const useTeams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('teams').select('*').order('created_at');
    setTeams((data as Team[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const createTeam = async (name: string) => {
    if (!user) return;
    const { data, error } = await supabase.from('teams')
      .insert({ name, owner_id: user.id })
      .select().single();
    if (error) throw error;
    const team = data as Team;
    setTeams(t => [...t, team]);
    return team;
  };

  const deleteTeam = async (id: string) => {
    const { error } = await supabase.from('teams').delete().eq('id', id);
    if (error) throw error;
    setTeams(t => t.filter(tt => tt.id !== id));
  };

  return { teams, loading, createTeam, deleteTeam, refresh: fetchTeams };
};

export const useTeamMembers = (teamId: string | null) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    if (!teamId) { setMembers([]); setLoading(false); return; }
    const { data } = await supabase
      .from('team_members')
      .select('*, profile:profiles(display_name, avatar_url)')
      .eq('team_id', teamId)
      .order('joined_at');
    setMembers((data as TeamMember[]) || []);
    setLoading(false);
  }, [teamId]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const removeMember = async (memberId: string) => {
    const { error } = await supabase.from('team_members').delete().eq('id', memberId);
    if (error) throw error;
    setMembers(m => m.filter(mm => mm.id !== memberId));
  };

  return { members, loading, removeMember, refresh: fetchMembers };
};
