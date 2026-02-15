import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Team } from '@/hooks/useTeams';
import { Lock, Users } from 'lucide-react';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teams: Team[];
  onCreate: (name: string, type: 'private' | 'team', teamId?: string) => Promise<void>;
};

const CreateProjectDialog = ({ open, onOpenChange, teams, onCreate }: Props) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'private' | 'team'>('private');
  const [teamId, setTeamId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (type === 'team' && !teamId) return;
    setSubmitting(true);
    try {
      await onCreate(name.trim(), type, type === 'team' ? teamId : undefined);
      setName('');
      setType('private');
      setTeamId('');
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>Create a private or team project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Project name" value={name} onChange={e => setName(e.target.value)} autoFocus />

          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === 'private' ? 'default' : 'outline'}
              className="flex-1 gap-2"
              onClick={() => { setType('private'); setTeamId(''); }}
            >
              <Lock size={14} /> Private
            </Button>
            <Button
              type="button"
              variant={type === 'team' ? 'default' : 'outline'}
              className="flex-1 gap-2"
              onClick={() => setType('team')}
              disabled={teams.length === 0}
            >
              <Users size={14} /> Team
            </Button>
          </div>

          {type === 'team' && (
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button type="submit" className="w-full" disabled={submitting || !name.trim() || (type === 'team' && !teamId)}>
            Create Project
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
