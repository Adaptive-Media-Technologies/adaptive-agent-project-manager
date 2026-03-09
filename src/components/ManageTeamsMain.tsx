import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTeams } from '@/hooks/useTeams';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

type Props = {
  onToggleSidebar?: () => void;
  isMobile?: boolean;
};

export default function ManageTeamsMain({ onToggleSidebar, isMobile }: Props) {
  const { user } = useAuth();
  const { teams, loading, createTeam, deleteTeam } = useTeams();
  const [showCreate, setShowCreate] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [creating, setCreating] = useState(false);

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
        <div className="mx-auto w-full max-w-2xl space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading teams…</p>
          ) : orderedTeams.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">No teams yet. Create one to start collaborating.</p>
            </div>
          ) : (
            orderedTeams.map((team) => {
              const isOwner = !!user && team.owner_id === user.id;
              return (
                <div
                  key={team.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <Users size={16} className="text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{team.name}</p>
                        {isOwner && (
                          <span className="text-[10px] rounded bg-primary/10 px-1.5 py-0.5 text-primary font-semibold">
                            Owner
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    title="Delete team"
                    className="h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={async () => {
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

