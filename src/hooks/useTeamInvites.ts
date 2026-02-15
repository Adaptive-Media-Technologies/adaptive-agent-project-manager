import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import emailjs from '@emailjs/browser';

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
      .ilike('email', user.email)
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

    // Fetch team name for the email
    const { data: teamData } = await supabase.from('teams').select('name').eq('id', teamId).single();

    // Fetch sender's display name
    const { data: profileData } = await supabase.from('profiles').select('display_name').eq('id', user.id).single();

    // Send invitation email via EmailJS
    try {
      await emailjs.send('service_9a115xi', 'template_802w2id', {
        from_name: profileData?.display_name || user.email || 'A teammate',
        team_name: teamData?.name || 'a team',
        to_email: email,
        app_url: window.location.origin,
        sent_at: new Date().toLocaleDateString('en-US', { dateStyle: 'medium' }),
      }, 'kZ9ndq6f7Nm0uSfDz');
    } catch (emailErr) {
      console.warn('Email notification failed:', emailErr);
    }
  };

  return { pendingInvites, loading, acceptInvite, declineInvite, sendInvite, refresh: fetchInvites };
};
