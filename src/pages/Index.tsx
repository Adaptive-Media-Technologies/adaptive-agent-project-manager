import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProjects, useTasks } from '@/hooks/useTasks';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useProfile } from '@/hooks/useProfile';
import { useProjectNotes, NOTE_COLORS, getNoteClasses, getNoteColorConfig } from '@/hooks/useProjectNotes';
import { useTeams } from '@/hooks/useTeams';
import { useTeamInvites } from '@/hooks/useTeamInvites';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import TaskList from '@/components/TaskList';
import ProfileSheet from '@/components/ProfileSheet';
import CreateProjectDialog from '@/components/CreateProjectDialog';
import { Plus, Info, Users, Lock, Check, X, Mail, ChevronRight, Pencil, Palette, Ban, Menu, MessageSquare, ListTodo, StickyNote } from 'lucide-react';
import ProjectChat from '@/components/ProjectChat';
import { useIsMobile } from '@/hooks/use-mobile';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { format } from 'date-fns';
import agntfindLogo from '@/assets/agntfind-logo.png';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const { projects, loading: projLoading, create: createProject, rename: renameProject, refresh: refreshProjects } = useProjects();
  const { teams, refresh: teamsRefresh } = useTeams();
  const { pendingInvites, acceptInvite, declineInvite } = useTeamInvites();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const { tasks, loading: tasksLoading, addTask, cycleStatus, reorder, deleteTask, renameTask } = useTasks(activeProjectId);
  const { logTime, taskMinutes } = useTimeEntries(activeProjectId);
  const { content: projectNote, color: noteColor, save: saveProjectNote, setColor: setNoteColor } = useProjectNotes(activeProjectId);
  const { profile } = useProfile();
  const [newTask, setNewTask] = useState('');
  const [noteExpanded, setNoteExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'chat'>('tasks');
  const [unreadChat, setUnreadChat] = useState(false);
  const handleChatNewMessage = useCallback(() => {
    if (activeTab !== 'chat') setUnreadChat(true);
  }, [activeTab]);

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
      await Promise.all([refreshProjects(), teamsRefresh()]);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openCount = tasks.filter(t => t.status === 'open').length;
  const doingCount = tasks.filter(t => t.status === 'in_progress').length;
  const doneCount = tasks.filter(t => t.status === 'complete').length;

  const ProjectButton = ({ id, name, icon }: { id: string; name: string; icon?: React.ReactNode }) => (
    <button
      onClick={() => { setActiveProjectId(id); if (isMobile) setSidebarOpen(false); }}
      className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] transition-card ${
        id === activeProjectId
          ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))] font-semibold border-l-[3px] border-l-primary'
          : 'text-[hsl(var(--sidebar-foreground)/0.7)] hover:bg-[hsl(var(--sidebar-accent)/0.6)] hover:text-[hsl(var(--sidebar-foreground))]'
      }`}
    >
      {icon}
      <span className="truncate flex-1">{name}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${isMobile ? 'fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-200' : 'w-60 shrink-0'} flex flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))] ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}`}>
        {/* Sidebar header with branding */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--sidebar-border))] px-4 py-4">
          <div className="flex items-center gap-2.5">
            <img src={agntfindLogo} alt="AgntFind" className="h-7 w-7 rounded-xl" />
            <span className="text-sm font-bold text-[hsl(var(--sidebar-foreground))] tracking-tight">AgntFind</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowProfile(true)} title="Profile">
              <Avatar className="h-7 w-7">
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
                <AvatarFallback className="text-[10px]">
                  {profile?.display_name ? profile.display_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'}
                </AvatarFallback>
              </Avatar>
            </button>
            {isMobile && (
              <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Create button */}
        <div className="px-3 pt-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-sm font-medium rounded-xl border-dashed border-[hsl(var(--sidebar-border))] text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
            onClick={() => { setShowCreateProject(true); if (isMobile) setSidebarOpen(false); }}
          >
            <Plus size={14} /> New Project
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <div className="space-y-1.5">
              <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-foreground)/0.5)] flex items-center gap-1">
                <Mail size={10} /> Invites
              </p>
              {pendingInvites.map(inv => (
                <div key={inv.id} className="flex items-center justify-between rounded-xl bg-[hsl(var(--sidebar-accent))] px-2.5 py-2">
                  <span className="text-xs text-[hsl(var(--sidebar-foreground))] truncate flex-1 font-medium">{inv.team?.name}</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleAcceptInvite(inv)} className="rounded-md p-1 hover:bg-background transition-colors">
                      <Check size={12} className="text-primary" />
                    </button>
                    <button onClick={() => declineInvite(inv.id)} className="rounded-md p-1 hover:bg-background transition-colors">
                      <X size={12} className="text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* My Projects */}
          <div className="space-y-1">
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-foreground)/0.5)] flex items-center gap-1">
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
                <CollapsibleTrigger className="w-full px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-foreground)/0.5)] flex items-center gap-1 group cursor-pointer hover:text-[hsl(var(--sidebar-foreground))] transition-colors">
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
                      onClick={async () => {
                        try {
                          const p = await createProject(`${team.name} Tasks`, 'team', team.id);
                          if (p) setActiveProjectId(p.id);
                          if (isMobile) setSidebarOpen(false);
                        } catch (err: any) {
                          toast.error(err.message);
                        }
                      }}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs text-[hsl(var(--sidebar-foreground)/0.5)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))] transition-colors"
                    >
                      <Plus size={12} /> New Task
                    </button>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </nav>

        <div className="border-t border-[hsl(var(--sidebar-border))] p-3">
          <Link to="/teams">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-xs text-[hsl(var(--sidebar-foreground)/0.6)] rounded-xl hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]">
              <Users size={13} /> Manage Teams
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex flex-1 flex-col">
        {activeProject ? (
          <>
            <header className="flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-4 md:px-6 py-3 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                {isMobile && (
                  <button onClick={() => setSidebarOpen(true)} className="mr-1 text-muted-foreground hover:text-foreground">
                    <Menu size={20} />
                  </button>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground truncate">{activeProject.name}</h2>
                    <button onClick={() => setShowDetails(true)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                      <Info size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                      {activeProject.type === 'team' ? <Users size={9} /> : <Lock size={9} />}
                      {activeProject.type === 'team' ? 'Team' : 'Private'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Segmented tab control */}
              <div className="flex items-center bg-muted rounded-lg p-0.5">
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    activeTab === 'tasks'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <ListTodo size={13} /> Tasks
                </button>
                <button
                  onClick={() => { setActiveTab('chat'); setUnreadChat(false); }}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    activeTab === 'chat'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <MessageSquare size={13} /> Chat
                  {unreadChat && <span className="h-2 w-2 rounded-full bg-destructive animate-pulse-dot" />}
                </button>
              </div>
            </header>

            {activeTab === 'chat' ? (
              <ProjectChat projectId={activeProject.id} onNewMessage={handleChatNewMessage} />
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-4">
                  {/* Project Note */}
                  {(() => { const noteConf = getNoteColorConfig(noteColor); return (
                  <div className={`rounded-xl border shadow-sm ${getNoteClasses(noteColor)} transition-card`}>
                    <div className="flex items-center gap-1.5 px-3 pt-2.5">
                      <StickyNote size={12} className={noteConf.value ? noteConf.text : 'text-muted-foreground'} />
                      <span className={`text-[10px] font-semibold uppercase tracking-wide ${noteConf.value ? noteConf.text : 'text-muted-foreground'}`}>Notes</span>
                    </div>
                    <textarea
                      value={projectNote}
                      onChange={e => saveProjectNote(e.target.value)}
                      onFocus={() => setNoteExpanded(true)}
                      onBlur={() => setNoteExpanded(false)}
                      placeholder="Project notes..."
                      className={`w-full resize-none bg-transparent px-3 py-2 text-sm ${noteConf.text} ${noteConf.placeholder} focus:outline-none transition-all duration-200 ${
                        noteExpanded ? 'min-h-[120px]' : 'max-h-[5.5rem] overflow-hidden'
                      }`}
                      rows={noteExpanded ? Math.max(5, projectNote.split('\n').length) : 4}
                    />
                    <div className="flex justify-end px-2 pb-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className={`rounded-md p-1 ${noteConf.value ? noteConf.text + ' opacity-60 hover:opacity-100' : 'text-muted-foreground hover:text-foreground'} hover:bg-accent/50 transition-colors`} title="Note colour">
                            <Palette size={13} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2" align="end">
                          <div className="flex gap-1.5">
                            {NOTE_COLORS.map(c => (
                              <button
                                key={c.value}
                                onClick={() => setNoteColor(c.value)}
                                title={c.name}
                                className={`h-6 w-6 rounded-full border-2 transition-all ${c.swatch} ${noteColor === c.value ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : 'hover:scale-110'}`}
                              >
                                {c.value === '' && noteColor === '' && <Ban size={12} className="mx-auto text-muted-foreground" />}
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  ); })()}
                  {tasksLoading ? (
                    <p className="text-sm text-muted-foreground">Loading tasks...</p>
                  ) : tasks.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-20">
                      <div className="rounded-2xl bg-accent p-5">
                        <ListTodo size={32} className="text-muted-foreground" />
                      </div>
                      <div className="text-center space-y-1.5">
                        <p className="text-lg font-semibold text-foreground">No tasks yet</p>
                        <p className="text-sm text-muted-foreground">Create your first task to get started</p>
                      </div>
                      <form onSubmit={handleAddTask} className="flex gap-2 w-full max-w-sm">
                        <div className="flex-1 flex items-center gap-2 rounded-xl border border-border bg-card px-3 shadow-sm">
                          <Plus size={15} className="text-muted-foreground shrink-0" />
                          <Input placeholder="Enter a task..." value={newTask} onChange={e => setNewTask(e.target.value)} className="text-sm border-0 shadow-none focus-visible:ring-0 bg-transparent px-0" autoFocus />
                        </div>
                        <Button type="submit" size="sm" disabled={!newTask.trim()} className="rounded-lg px-4">Add</Button>
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
                      onRenameTask={renameTask}
                    />
                  )}
                </div>
                {/* Floating task input */}
                <form onSubmit={handleAddTask} className="bg-card px-4 md:px-6 py-3">
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 shadow-sm">
                    <Plus size={15} className="text-muted-foreground shrink-0" />
                    <Input placeholder="Add a task..." value={newTask} onChange={e => setNewTask(e.target.value)} className="text-sm border-0 shadow-none focus-visible:ring-0 bg-transparent px-0" />
                    <Button type="submit" size="sm" variant="ghost" className="shrink-0 rounded-lg h-8 px-3" disabled={!newTask.trim()}>
                      <Plus size={14} />
                    </Button>
                  </div>
                </form>
              </>
            )}
            <Sheet open={showDetails} onOpenChange={(open) => { setShowDetails(open); if (!open) setEditingName(false); }}>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    {editingName ? (
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!draftName.trim() || !activeProject) return;
                        try {
                          await renameProject(activeProject.id, draftName.trim());
                          setEditingName(false);
                          toast.success('Project renamed');
                        } catch (err: any) { toast.error(err.message); }
                      }} className="flex items-center gap-2 flex-1">
                        <Input value={draftName} onChange={e => setDraftName(e.target.value)} className="text-sm h-8" autoFocus />
                        <Button type="submit" size="sm" variant="ghost" disabled={!draftName.trim()}><Check size={14} /></Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => setEditingName(false)}><X size={14} /></Button>
                      </form>
                    ) : (
                      <>
                        {activeProject.name}
                        <button onClick={() => { setDraftName(activeProject.name); setEditingName(true); }} className="text-muted-foreground hover:text-foreground">
                          <Pencil size={14} />
                        </button>
                      </>
                    )}
                  </SheetTitle>
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
          <div className="flex flex-1 flex-col items-center justify-center gap-3 relative">
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} className="absolute top-4 left-4 text-muted-foreground hover:text-foreground">
                <Menu size={20} />
              </button>
            )}
            <img src={agntfindLogo} alt="AgntFind" className="h-20 w-20 mb-1 rounded-2xl shadow-sm" />
            <h1 className="text-3xl font-bold text-foreground tracking-tight">AgntFind</h1>
            <p className="text-sm text-muted-foreground">{projLoading ? 'Loading...' : 'Select or create a project to get started'}</p>
          </div>
        )}
      </main>

      <ProfileSheet open={showProfile} onOpenChange={setShowProfile} />
      <CreateProjectDialog open={showCreateProject} onOpenChange={setShowCreateProject} teams={teams} onCreate={handleCreateProject} />
    </div>
  );
};

export default Index;
