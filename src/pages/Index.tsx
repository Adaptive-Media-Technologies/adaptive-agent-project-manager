import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProjects, useTasks } from '@/hooks/useTasks';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useProfile } from '@/hooks/useProfile';
import { useTeams } from '@/hooks/useTeams';
import { useTeamInvites } from '@/hooks/useTeamInvites';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import TaskList from '@/components/TaskList';
import ProfileSheet from '@/components/ProfileSheet';
import CreateProjectDialog from '@/components/CreateProjectDialog';
import { Plus, Info, Users, Lock, Check, X, Mail, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { format } from 'date-fns';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { projects, loading: projLoading, create: createProject, refresh: refreshProjects } = useProjects();
  const { teams } = useTeams();
  const { pendingInvites, acceptInvite, declineInvite } = useTeamInvites();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const { tasks, loading: tasksLoading, addTask, cycleStatus, reorder, deleteTask } = useTasks(activeProjectId);
  const { logTime, taskMinutes } = useTimeEntries(activeProjectId);
  const { profile } = useProfile();
  const [newTask, setNewTask] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);

  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const activeProject = projects.find(p => p.id === activeProjectId);
  const privateProjects = projects.filter(p => p.type === 'private');
  const teamGroups = teams.map(t => ({
    team: t,
    projects: projects.filter(p => p.type === 'team' && p.team_id === t.id),
  }));

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      await addTask(newTask.trim());
      setNewTask('');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCreateProject = async (name: string, type: 'private' | 'team', teamId?: string) => {
    try {
      const p = await createProject(name, type, teamId);
      if (p) setActiveProjectId(p.id);
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  const handleLogTime = async (taskId: string, minutes: number) => {
    try {
      await logTime(taskId, minutes);
      toast.success(`Logged ${minutes} min`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAcceptInvite = async (invite: any) => {
    try {
      await acceptInvite(invite);
      toast.success('Joined team!');
      refreshProjects();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openCount = tasks.filter(t => t.status === 'open').length;
  const doingCount = tasks.filter(t => t.status === 'in_progress').length;
  const doneCount = tasks.filter(t => t.status === 'complete').length;

  const ProjectButton = ({ id, name, icon }: { id: string; name: string; icon?: React.ReactNode }) => (
    <button
      onClick={() => setActiveProjectId(id)}
      className={`w-full flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
        id === activeProjectId ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      }`}
    >
      {icon}
      <span className="truncate">{name}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h1 className="text-sm font-semibold text-foreground">Projects</h1>
          <button onClick={() => setShowProfile(true)} title="Profile">
            <Avatar className="h-7 w-7">
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
              <AvatarFallback className="text-[10px]">
                {profile?.display_name ? profile.display_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <div className="space-y-1">
              <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Mail size={10} /> Invites
              </p>
              {pendingInvites.map(inv => (
                <div key={inv.id} className="flex items-center justify-between rounded-md bg-accent px-2 py-1.5">
                  <span className="text-xs text-foreground truncate flex-1">{inv.team?.name}</span>
                  <div className="flex gap-0.5">
                    <button onClick={() => handleAcceptInvite(inv)} className="rounded p-0.5 hover:bg-background">
                      <Check size={12} className="text-primary" />
                    </button>
                    <button onClick={() => declineInvite(inv.id)} className="rounded p-0.5 hover:bg-background">
                      <X size={12} className="text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* My Projects */}
          <div className="space-y-1">
            <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Lock size={10} /> My Projects
            </p>
            {privateProjects.map(p => (
              <ProjectButton key={p.id} id={p.id} name={p.name} />
            ))}
          </div>

          {/* Team Projects */}
          {teamGroups.map(({ team, projects: teamProjects }) => (
            <Collapsible key={team.id} defaultOpen={teamProjects.some(p => p.id === activeProjectId)}>
              <div className="space-y-1">
                <CollapsibleTrigger className="w-full px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 group cursor-pointer hover:text-foreground transition-colors">
                  <ChevronRight size={10} className="transition-transform group-data-[state=open]:rotate-90" />
                  <Users size={10} /> {team.name}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {teamProjects.length > 0 ? (
                    teamProjects.map(p => (
                      <ProjectButton key={p.id} id={p.id} name={p.name} />
                    ))
                  ) : (
                    <button
                      onClick={() => setShowCreateProject(true)}
                      className="w-full flex items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    >
                      <Plus size={12} /> New Task
                    </button>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </nav>

        <div className="border-t border-border p-2 space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sm" onClick={() => setShowCreateProject(true)}>
            <Plus size={14} /> New Project
          </Button>
          <Link to="/teams">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sm text-muted-foreground">
              <Users size={14} /> Manage Teams
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex flex-1 flex-col">
        {activeProject ? (
          <>
            <header className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                {activeProject.type === 'team' ? <Users size={16} className="text-muted-foreground" /> : <Lock size={16} className="text-muted-foreground" />}
                <h2 className="text-lg font-semibold text-foreground">{activeProject.name}</h2>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowDetails(true)} title="Project details">
                <Info size={16} />
              </Button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {tasksLoading ? (
                <p className="text-sm text-muted-foreground">Loading tasks...</p>
              ) : tasks.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
                  <div className="rounded-full bg-accent p-4">
                    <Plus size={28} className="text-muted-foreground" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-base font-medium text-foreground">No tasks yet</p>
                    <p className="text-sm text-muted-foreground">Create your first task to get started</p>
                  </div>
                  <form onSubmit={handleAddTask} className="flex gap-2 w-full max-w-sm">
                    <Input placeholder="Enter a task..." value={newTask} onChange={e => setNewTask(e.target.value)} className="text-sm" autoFocus />
                    <Button type="submit" size="sm" disabled={!newTask.trim()}>Add</Button>
                  </form>
                </div>
              ) : (
                <TaskList
                  tasks={tasks}
                  onCycle={cycleStatus}
                  onDelete={deleteTask}
                  onReorder={reorder}
                  onLogTime={handleLogTime}
                  taskMinutes={taskMinutes}
                />
              )}
            </div>
            <form onSubmit={handleAddTask} className="border-t border-border px-6 py-3">
              <div className="flex gap-2">
                <Input placeholder="Add a task..." value={newTask} onChange={e => setNewTask(e.target.value)} className="text-sm" />
                <Button type="submit" size="icon" variant="ghost">
                  <Plus size={16} />
                </Button>
              </div>
            </form>

            <Sheet open={showDetails} onOpenChange={setShowDetails}>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>{activeProject.name}</SheetTitle>
                  <SheetDescription>Project details</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="text-sm text-foreground capitalize">{activeProject.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm text-foreground">{format(new Date(activeProject.created_at), 'PPP')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tasks Summary</p>
                    <div className="mt-1 flex gap-3 text-sm">
                      <span className="text-muted-foreground">Open: {openCount}</span>
                      <span className="text-primary">Doing: {doingCount}</span>
                      <span className="text-accent-foreground">Done: {doneCount}</span>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <img src="/favicon.png" alt="AgntFind" className="h-16 w-16 mb-2" />
            <h1 className="text-3xl font-bold text-foreground">AgntFind</h1>
            <p className="text-muted-foreground">{projLoading ? 'Loading...' : 'Select or create a project'}</p>
          </div>
        )}
      </main>

      <ProfileSheet open={showProfile} onOpenChange={setShowProfile} />
      <CreateProjectDialog open={showCreateProject} onOpenChange={setShowCreateProject} teams={teams} onCreate={handleCreateProject} />
    </div>
  );
};

export default Index;
