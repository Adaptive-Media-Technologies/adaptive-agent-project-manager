import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTeams, useTeamMembers, type Team } from '@/hooks/useTeams';
import { useTeamInvites } from '@/hooks/useTeamInvites';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Users, Send, UserMinus, Mail, Check, X, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

type Props = {
  onToggleSidebar?: () => void;
  isMobile?: boolean;
};

const TeamMembersSection = ({ team, isOwner }: { team: Team; isOwner: boolean }) => {
  const { members, loading, removeMember } = useTeamMembers(team.id);
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
      toast.error(err?.message || 'Failed to send invite');
    } finally {
      setSending(false);
    }
  };

  const handleRemove = async (memberId: string, name: string) => {
    if (!window.confirm(`Remove ${name} from team?`)) return;
    try {
      await removeMember(memberId);
      toast.success(`Removed ${name}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove member');
    }
  };

  return (
    <div className="space-y-3 p-4 bg-muted/30 rounded-b-xl border-t border-border">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        <Users size={12} /> Members ({members.length})
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-2">
          {members.map(m => (
            <div key={m.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-8 w-8">
                  {m.profile?.avatar_url && <AvatarImage src={m.profile.avatar_url} />}
                  <AvatarFallback className="text-[10px]">
                    {m.profile?.display_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">{m.profile?.display_name || 'Unknown'}</span>
                    {m.role === 'owner' && (
                      <span className="text-[10px] rounded bg-primary/10 px-1.5 py-0.5 text-primary font-semibold shrink-0">Owner</span>
                    )}
                  </div>
                  {m.profile?.username && (
                    <span className="text-xs text-muted-foreground truncate">@{m.profile.username}</span>
                  )}
                </div>
              </div>
              {isOwner && m.role !== 'owner' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={() => handleRemove(m.id, m.profile?.display_name || 'member')}
                  title="Remove member"
                >
                  <UserMinus size={14} />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      {isOwner ? (
        <form onSubmit={handleInvite} className="flex gap-2 pt-1">
          <Input
            type="email"
            placeholder="Invite by email…"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            className="h-9 text-sm"
          />
          <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={sending || !inviteEmail.trim()}>
            <Send size={14} />
          </Button>
        </form>
      ) : (
        <p className="text-xs text-muted-foreground italic">Only the team owner can invite or remove members.</p>
      )}
    </div>
  );
};

export default function ManageTeamsMain({ onToggleSidebar, isMobile }: Props) {
  const { user } = useAuth();
  const { teams, loading, createTeam, deleteTeam } = useTeams();
  const { pendingInvites, acceptInvite, declineInvite } = useTeamInvites();
  const [showCreate, setShowCreate] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [creating, setCreating] = useState(false);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  const orderedTeams = useMemo(() => teams.slice().sort((a, b) => a.name.localeCompare(b.name)), [teams]);

  const handleCreate = async () => {
    if (!newTeamName.trim()) return;
    try {
      setCreating(true);
      await createTeam(newTeamName.trim());
      setNewTeamName('');
      setShowCreate(false);
      toast.success('Team created');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  const handleAccept = async (invite: any) => {
    try {
      await acceptInvite(invite);
      toast.success('Joined team!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to accept invite');
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await declineInvite(id);
      toast.success('Invite declined');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to decline invite');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex items-center justify-between gap-3 border-b border-border bg-card/80 backdrop-blur-sm px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          {isMobile && (
            <button
              onClick={onToggleSidebar}
              className="relative z-[60] mr-1 flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-foreground active:scale-95 transition-all"
              type="button"
              aria-label="Toggle menu"
            >
              <Users size={18} />
            </button>
          )}
          <Users size={20} className="text-primary" />
          <h2 className="text-lg font-bold text-foreground truncate">Teams</h2>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5">
          <Plus size={14} /> New Team
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-2xl space-y-4">
          {pendingInvites.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Mail size={12} /> Pending Invites
              </h3>
              {pendingInvites.map(inv => (
                <div key={inv.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                  <span className="text-sm text-foreground">
                    You're invited to <strong>{inv.team?.name || 'a team'}</strong>
                  </span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:bg-green-500/10" onClick={() => handleAccept(inv)}>
                      <Check size={14} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDecline(inv.id)}>
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading teams…</p>
          ) : orderedTeams.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">No teams yet. Create one to start collaborating.</p>
            </div>
          ) : (
            orderedTeams.map((team) => {
              const isOwner = !!user && team.owner_id === user.id;
              const isExpanded = expandedTeam === team.id;
              return (
                <div key={team.id} className="rounded-xl border border-border bg-card overflow-hidden">
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-accent/30 transition-colors"
                    onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {isExpanded ? (
                        <ChevronDown size={16} className="text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                      )}
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
                        <Users size={16} className="text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{team.name}</p>
                          {isOwner && (
                            <span className="text-[10px] rounded bg-primary/10 px-1.5 py-0.5 text-primary font-semibold shrink-0">
                              Owner
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isOwner && (
                      <button
                        type="button"
                        title="Delete team"
                        className="h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const ok = window.confirm(`Delete team "${team.name}"?`);
                          if (!ok) return;
                          try {
                            await deleteTeam(team.id);
                            toast.success('Team deleted');
                          } catch (err: any) {
                            toast.error(err?.message || 'Failed to delete team');
                          }
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  {isExpanded && <TeamMembersSection team={team} isOwner={isOwner} />}
                </div>
              );
            })
          )}
        </div>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create team</DialogTitle>
            <DialogDescription>Teams let you collaborate on shared projects.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              placeholder="Team name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating || !newTeamName.trim()}>
              {creating ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
