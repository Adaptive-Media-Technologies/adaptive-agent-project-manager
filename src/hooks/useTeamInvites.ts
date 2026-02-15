import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type TeamInvite = {
  id: string;
  team_id: string;
  email: string;
  invited_by: string;
  status: string;
  created_at: string;
  team?: { name: string };
};

export const useTeamInvites = () => {
  const { user } = useAuth();
  const [pendingInvites, setPendingInvites] = useState<TeamInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = useCallback(async () => {
    if (!user?.email) { setLoading(false); return; }
    const { data } = await supabase
      .from('team_invites')
      .select('*, team:teams(name)')
      .eq('email', user.email)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    setPendingInvites((data as TeamInvite[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchInvites(); }, [fetchInvites]);

  const acceptInvite = async (invite: TeamInvite) => {
    if (!user) return;
    // Add user to team
    const { error: memberError } = await supabase.from('team_members')
      .insert({ team_id: invite.team_id, user_id: user.id, role: 'member' });
    if (memberError) throw memberError;
    // Update invite status
    const { error } = await supabase.from('team_invites')
      .update({ status: 'accepted' }).eq('id', invite.id);
    if (error) throw error;
    setPendingInvites(p => p.filter(i => i.id !== invite.id));
  };

  const declineInvite = async (inviteId: string) => {
    const { error } = await supabase.from('team_invites')
      .update({ status: 'declined' }).eq('id', inviteId);
    if (error) throw error;
    setPendingInvites(p => p.filter(i => i.id !== inviteId));
  };

  const sendInvite = async (teamId: string, email: string) => {
    if (!user) return;
    const { error } = await supabase.from('team_invites')
      .insert({ team_id: teamId, email, invited_by: user.id });
    if (error) throw error;
  };

  return { pendingInvites, loading, acceptInvite, declineInvite, sendInvite, refresh: fetchInvites };
};
