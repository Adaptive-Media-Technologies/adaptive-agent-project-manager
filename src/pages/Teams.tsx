import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTeams, useTeamMembers, type Team } from '@/hooks/useTeams';
import { useTeamInvites } from '@/hooks/useTeamInvites';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Send, UserMinus, Trash2, Users, Mail, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const TeamMembersSection = ({ team, isOwner }: { team: Team; isOwner: boolean }) => {
  const { members, loading, removeMember, refresh } = useTeamMembers(team.id);
  const { sendInvite } = useTeamInvites();
  const [inviteEmail, setInviteEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSending(true);
    try {
      await sendInvite(team.id, inviteEmail.trim());
      toast.success(`Invite sent to ${inviteEmail}`);
      setInviteEmail('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleRemove = async (memberId: string, name: string) => {
    try {
      await removeMember(memberId);
      toast.success(`Removed ${name}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        <Users size={12} /> Members ({members.length})
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-2">
          {members.map(m => (
            <div key={m.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  {m.profile?.avatar_url && <AvatarImage src={m.profile.avatar_url} />}
                  <AvatarFallback className="text-[9px]">
                    {m.profile?.display_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground">{m.profile?.display_name || 'Unknown'}</span>
                {m.role === 'owner' && (
                  <span className="text-[10px] rounded bg-primary/10 px-1.5 py-0.5 text-primary font-medium">Owner</span>
                )}
              </div>
              {isOwner && m.role !== 'owner' && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemove(m.id, m.profile?.display_name || 'member')}>
                  <UserMinus size={12} />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      {isOwner && (
        <form onSubmit={handleInvite} className="flex gap-2">
          <Input
            type="email"
            placeholder="Invite by email..."
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            className="h-8 text-sm"
          />
          <Button type="submit" size="icon" variant="ghost" className="h-8 w-8 shrink-0" disabled={sending}>
            <Send size={14} />
          </Button>
        </form>
      )}
    </div>
  );
};

const Teams = () => {
  const { user, loading: authLoading } = useAuth();
  const { teams, loading: teamsLoading, createTeam, deleteTeam } = useTeams();
  const { pendingInvites, acceptInvite, declineInvite } = useTeamInvites();
  const [showCreate, setShowCreate] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    try {
      await createTeam(newTeamName.trim());
      setNewTeamName('');
      setShowCreate(false);
      toast.success('Team created');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTeam(id);
      toast.success('Team deleted');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAccept = async (invite: any) => {
    try {
      await acceptInvite(invite);
      toast.success('Joined team!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await declineInvite(id);
      toast.success('Invite declined');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-foreground">Teams</h1>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={14} className="mr-1" /> New Team
        </Button>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-6 space-y-6">
        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Mail size={14} /> Pending Invites
            </h2>
            {pendingInvites.map(inv => (
              <div key={inv.id} className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3">
                <span className="text-sm text-foreground">
                  You're invited to <strong>{inv.team?.name || 'a team'}</strong>
                </span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleAccept(inv)}>
                    <Check size={14} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDecline(inv.id)}>
                    <X size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Teams List */}
        {teamsLoading ? (
          <p className="text-sm text-muted-foreground">Loading teams...</p>
        ) : teams.length === 0 ? (
          <p className="text-sm text-muted-foreground">No teams yet. Create one to start collaborating.</p>
        ) : (
          <div className="space-y-3">
            {teams.map(team => {
              const isOwner = team.owner_id === user.id;
              const isExpanded = expandedTeam === team.id;
              return (
                <div key={team.id} className="rounded-lg border border-border bg-card">
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer"
                    onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{team.name}</span>
                      {isOwner && (
                        <span className="text-[10px] rounded bg-primary/10 px-1.5 py-0.5 text-primary font-medium">Owner</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {isOwner && (
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                          onClick={e => { e.stopPropagation(); handleDelete(team.id); }}
                        >
                          <Trash2 size={12} />
                        </Button>
                      )}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-border px-4 py-3">
                      <TeamMembersSection team={team} isOwner={isOwner} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Team Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
            <DialogDescription>Create a new team to collaborate on projects.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input placeholder="Team name" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} autoFocus />
            <Button type="submit" className="w-full">Create</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Teams;
