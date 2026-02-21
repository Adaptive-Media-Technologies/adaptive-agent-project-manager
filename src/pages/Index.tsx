import { useState, useCallback, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { useProjects, useTasks } from '@/hooks/useTasks';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useProfile } from '@/hooks/useProfile';
import { useProjectNotes, NOTE_COLORS, getNoteClasses, getNoteColorConfig } from '@/hooks/useProjectNotes';
import { useTeams } from '@/hooks/useTeams';
import { useTeamInvites } from '@/hooks/useTeamInvites';
import { useAgents, type Agent } from '@/hooks/useAgents';
import { useUnreadCounts } from '@/hooks/useUnreadCounts';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FormattingToolbar from '@/components/FormattingToolbar';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import TaskList from '@/components/TaskList';
import ProfileSheet from '@/components/ProfileSheet';
import CreateProjectDialog from '@/components/CreateProjectDialog';
import {
  Plus, Info, Users, Lock, Check, X, Mail, ChevronRight, Pencil, Palette, Ban,
  Menu, MessageSquare, ListTodo, StickyNote, Home, Settings, FolderOpen, Bot,
  CalendarDays, GripVertical, Hash, Trash2, Copy, Key, Sun, Moon,
} from 'lucide-react';
import ProjectChat from '@/components/ProjectChat';
import { useIsMobile } from '@/hooks/use-mobile';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import agntfindLogo from '@/assets/agntfind-logo.png';
import CalendarView from '@/pages/CalendarView';
import LandingPage from '@/pages/LandingPage';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Project } from '@/hooks/useTasks';


const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const { projects, loading: projLoading, create: createProject, rename: renameProject, reorderProjects, refresh: refreshProjects } = useProjects();
  const { teams, refresh: teamsRefresh } = useTeams();
  const { pendingInvites, acceptInvite, declineInvite } = useTeamInvites();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const { tasks, loading: tasksLoading, addTask, cycleStatus, reorder, deleteTask, renameTask, updateDueDate, assignTask, unassignTask } = useTasks(activeProjectId);
  const { logTime, taskMinutes } = useTimeEntries(activeProjectId);
  const { content: projectNote, color: noteColor, save: saveProjectNote, setColor: setNoteColor } = useProjectNotes(activeProjectId);
  const { profile } = useProfile();
  const { agents, loading: agentsLoading, createAgent, deleteAgent, updateAgentProjects } = useAgents();
  const [newTask, setNewTask] = useState('');
  const taskInputRef = useRef<HTMLTextAreaElement>(null);
  const [noteExpanded, setNoteExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRailTab, setActiveRailTab] = useState<'home' | 'chat' | 'teams' | 'agents' | 'calendar' | 'settings'>('home');

  // Agent dialog state
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentProjectIds, setAgentProjectIds] = useState<string[]>([]);
  const [agentCreating, setAgentCreating] = useState(false);
  const [newKeyModal, setNewKeyModal] = useState<{ agent: Agent; rawKey: string } | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Chat state
  const [activeChatProjectId, setActiveChatProjectId] = useState<string | null>(null);
  const projectIds = projects.map(p => p.id);
  const { counts: unreadCounts, totalUnread, markRead } = useUnreadCounts(projectIds);

  // When entering chat rail, auto-select first project if none selected
  useEffect(() => {
    if (activeRailTab === 'chat' && !activeChatProjectId && projects.length > 0) {
      const firstId = projects[0].id;
      setActiveChatProjectId(firstId);
      markRead(firstId);
    }
  }, [activeRailTab, activeChatProjectId, projects, markRead]);

  const selectChatProject = useCallback((projectId: string) => {
    setActiveChatProjectId(projectId);
    markRead(projectId);
    if (isMobile) setSidebarOpen(false);
  }, [isMobile, markRead]);

  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return <LandingPage />;

  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeChatProject = projects.find(p => p.id === activeChatProjectId);
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

  // Sortable project button (used in home rail)
  const SortableProjectButton = ({ project }: { project: Project }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: project.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.4 : 1,
    };

    return (
      <div ref={setNodeRef} style={style} className="group flex items-center gap-1">
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab text-[hsl(var(--sidebar-panel-foreground)/0.2)] opacity-0 group-hover:opacity-100 transition-opacity active:cursor-grabbing px-0.5"
          title="Drag to reorder"
        >
          <GripVertical size={12} />
        </button>
        <button
          onClick={() => { setActiveProjectId(project.id); if (isMobile) setSidebarOpen(false); }}
          className={`flex-1 flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] transition-card min-w-0 ${
            project.id === activeProjectId
              ? 'bg-[hsl(var(--sidebar-panel-active-bg))] text-[hsl(var(--sidebar-panel-active))] font-semibold border border-[hsl(var(--sidebar-panel-active)/0.4)]'
              : 'text-[hsl(var(--sidebar-panel-foreground)/0.6)] hover:bg-[hsl(var(--sidebar-panel-muted))] hover:text-[hsl(var(--sidebar-panel-foreground))]'
          }`}
        >
          <FolderOpen size={14} className="shrink-0 opacity-50" />
          <span className="truncate flex-1">{project.name}</span>
        </button>
      </div>
    );
  };

  // Chat channel row (used in chat rail panel)
  const ChatProjectRow = ({ project }: { project: Project }) => {
    const unread = unreadCounts[project.id] || 0;
    const isActive = project.id === activeChatProjectId;
    return (
      <button
        onClick={() => selectChatProject(project.id)}
        className={`w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors min-w-0 ${
          isActive
            ? 'bg-[hsl(var(--sidebar-panel-active-bg))] text-[hsl(var(--sidebar-panel-active))] font-semibold border border-[hsl(var(--sidebar-panel-active)/0.4)]'
            : 'text-[hsl(var(--sidebar-panel-foreground)/0.6)] hover:bg-[hsl(var(--sidebar-panel-muted))] hover:text-[hsl(var(--sidebar-panel-foreground))]'
        }`}
      >
        <Hash size={13} className="shrink-0 opacity-50" />
        <span className="truncate flex-1">{project.name}</span>
        {unread > 0 && (
          <span className="shrink-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    );
  };

  const railItems = [
    { key: 'home' as const, icon: Home, label: 'Home' },
    { key: 'chat' as const, icon: MessageSquare, label: 'Chat' },
    { key: 'calendar' as const, icon: CalendarDays, label: 'Calendar' },
    { key: 'teams' as const, icon: Users, label: 'Manage Teams' },
    { key: 'agents' as const, icon: Bot, label: 'Manage Agents' },
  ];

  // Panel header label
  const panelTitle =
    activeRailTab === 'home' ? 'Home'
    : activeRailTab === 'chat' ? 'Messages'
    : activeRailTab === 'calendar' ? 'Calendar'
    : activeRailTab === 'teams' ? 'Manage Teams'
    : activeRailTab === 'agents' ? 'Manage Agents'
    : 'Settings';

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* 2-Level Sidebar */}
      <aside className={`${isMobile ? 'fixed inset-y-0 left-0 z-50 transition-transform duration-200' : 'shrink-0'} flex ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}`}>
        {/* Level 1: Icon Rail */}
        <div className="flex w-[52px] flex-col items-center bg-[hsl(var(--sidebar-background))] py-3 gap-1 border-r border-[hsl(var(--sidebar-border))]">
          {/* Logo */}
          <div className="mb-3">
            <img src={agntfindLogo} alt="Agntive" className="h-8 w-8 rounded-xl" />
          </div>

          {/* Rail nav icons */}
          {railItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveRailTab(item.key)}
              title={item.label}
              className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                activeRailTab === item.key
                  ? 'bg-[hsl(var(--sidebar-active))] text-[hsl(var(--sidebar-active-foreground))]'
                  : 'text-[hsl(var(--sidebar-foreground)/0.5)] hover:bg-[hsl(var(--sidebar-accent)/0.5)] hover:text-[hsl(var(--sidebar-foreground)/0.8)]'
              }`}
            >
              <item.icon size={18} />
              {/* Unread badge on chat icon */}
              {item.key === 'chat' && totalUnread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold px-0.5 leading-none">
                  {totalUnread > 9 ? '9+' : totalUnread}
                </span>
              )}
            </button>
          ))}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Dark/Light mode toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[hsl(var(--sidebar-foreground)/0.5)] hover:bg-[hsl(var(--sidebar-accent)/0.5)] hover:text-[hsl(var(--sidebar-foreground)/0.8)] transition-all"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Settings at bottom */}
          <button
            onClick={() => setActiveRailTab('settings')}
            title="Settings"
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
              activeRailTab === 'settings'
                ? 'bg-[hsl(var(--sidebar-active))] text-[hsl(var(--sidebar-active-foreground))]'
                : 'text-[hsl(var(--sidebar-foreground)/0.5)] hover:bg-[hsl(var(--sidebar-accent)/0.5)] hover:text-[hsl(var(--sidebar-foreground)/0.8)]'
            }`}
          >
            <Settings size={18} />
          </button>

          {/* Profile avatar at bottom of rail */}
          <button onClick={() => setShowProfile(true)} title="Profile" className="mb-1">
            <Avatar className="h-8 w-8">
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
              <AvatarFallback className="text-[10px] bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]">
                {profile?.display_name ? profile.display_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>

        {/* Level 2: Content Panel */}
        <div className="flex w-[232px] flex-col bg-[hsl(var(--sidebar-panel-background))] border-r border-[hsl(var(--sidebar-panel-border))]">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[hsl(var(--sidebar-panel-border))]">
            <span className="text-sm font-bold text-[hsl(var(--sidebar-panel-foreground))] tracking-tight">
              {panelTitle}
            </span>
            <div className="flex items-center gap-1">
              {activeRailTab !== 'chat' && activeRailTab !== 'agents' && (
                <button
                  onClick={() => { setShowCreateProject(true); if (isMobile) setSidebarOpen(false); }}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-[hsl(var(--sidebar-panel-foreground)/0.5)] hover:bg-[hsl(var(--sidebar-panel-muted))] hover:text-[hsl(var(--sidebar-panel-foreground))] transition-colors"
                  title="New Project"
                >
                  <Plus size={15} />
                </button>
              )}
              {activeRailTab === 'agents' && (
                <button
                  onClick={() => { setShowAddAgent(true); setAgentName(''); setAgentEmail(''); setAgentProjectIds([]); }}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-[hsl(var(--sidebar-panel-foreground)/0.5)] hover:bg-[hsl(var(--sidebar-panel-muted))] hover:text-[hsl(var(--sidebar-panel-foreground))] transition-colors"
                  title="Add Agent"
                >
                  <Plus size={15} />
                </button>
              )}
              {isMobile && (
                <button onClick={() => setSidebarOpen(false)} className="flex h-6 w-6 items-center justify-center rounded-md text-[hsl(var(--sidebar-panel-foreground)/0.5)] hover:text-[hsl(var(--sidebar-panel-foreground))]">
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* ============ HOME PANEL ============ */}
          {activeRailTab === 'home' ? (
            <nav className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* Pending Invites */}
              {pendingInvites.length > 0 && (
                <div className="space-y-1.5">
                  <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-panel-foreground)/0.4)] flex items-center gap-1">
                    <Mail size={10} /> Invites
                  </p>
                  {pendingInvites.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between rounded-lg bg-[hsl(var(--sidebar-panel-muted))] px-2.5 py-2">
                      <span className="text-xs text-[hsl(var(--sidebar-panel-foreground))] truncate flex-1 font-medium">{inv.team?.name}</span>
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

              {/* My Projects — sortable */}
              <div className="space-y-0.5">
                <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-panel-foreground)/0.4)] flex items-center gap-1">
                  <Lock size={10} /> My Projects
                </p>
                <DndContext
                  sensors={dndSensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event: DragEndEvent) => {
                    const { active, over } = event;
                    if (!over || active.id === over.id) return;
                    const from = privateProjects.findIndex(p => p.id === active.id);
                    const to = privateProjects.findIndex(p => p.id === over.id);
                    if (from !== -1 && to !== -1) reorderProjects(privateProjects, from, to);
                  }}
                >
                  <SortableContext items={privateProjects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                    {privateProjects.map(p => (
                      <SortableProjectButton key={p.id} project={p} />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>

              {/* Team Projects (Spaces) — sortable per team */}
              {teamGroups.length > 0 && (
                <div className="space-y-0.5">
                  <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-panel-foreground)/0.4)]">
                    Team Projects
                  </p>
                  {teamGroups.map(({ team, projects: teamProjects }) => (
                    <Collapsible key={team.id} defaultOpen={teamProjects.some(p => p.id === activeProjectId)}>
                      <div className="space-y-0.5">
                        <CollapsibleTrigger className="w-full px-3 py-1.5 text-[13px] font-semibold text-[hsl(var(--sidebar-panel-foreground)/0.8)] flex items-center gap-2 group cursor-pointer hover:bg-[hsl(var(--sidebar-panel-muted))] rounded-lg transition-colors">
                          <ChevronRight size={12} className="transition-transform group-data-[state=open]:rotate-90 text-[hsl(var(--sidebar-panel-foreground)/0.4)]" />
                          <Users size={13} className="text-[hsl(var(--sidebar-panel-active))]" />
                          <span className="truncate">{team.name}</span>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="ml-4 pl-3 border-l border-[hsl(var(--sidebar-panel-border))] space-y-0.5">
                            {teamProjects.length > 0 ? (
                              <DndContext
                                sensors={dndSensors}
                                collisionDetection={closestCenter}
                                onDragEnd={(event: DragEndEvent) => {
                                  const { active, over } = event;
                                  if (!over || active.id === over.id) return;
                                  const from = teamProjects.findIndex(p => p.id === active.id);
                                  const to = teamProjects.findIndex(p => p.id === over.id);
                                  if (from !== -1 && to !== -1) reorderProjects(teamProjects, from, to);
                                }}
                              >
                                <SortableContext items={teamProjects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                                  {teamProjects.map(p => (
                                    <SortableProjectButton key={p.id} project={p} />
                                  ))}
                                </SortableContext>
                              </DndContext>
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
                                className="w-full flex items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs text-[hsl(var(--sidebar-panel-foreground)/0.4)] hover:bg-[hsl(var(--sidebar-panel-muted))] hover:text-[hsl(var(--sidebar-panel-foreground))] transition-colors"
                              >
                                <Plus size={12} /> New Task
                              </button>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))}
                </div>
              )}
            </nav>

          ) : activeRailTab === 'chat' ? (
            /* ============ CHAT PANEL ============ */
            <nav className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* MY CHATS */}
              {privateProjects.length > 0 && (
                <div className="space-y-0.5">
                  <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-panel-foreground)/0.4)]">
                    My Chats
                  </p>
                  {privateProjects.map(p => <ChatProjectRow key={p.id} project={p} />)}
                </div>
              )}

              {/* TEAM CHATS — flat list, no collapsible */}
              {teamGroups.some(g => g.projects.length > 0) && (
                <div className="space-y-0.5">
                  <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-panel-foreground)/0.4)]">
                    Team Chats
                  </p>
                  {teamGroups.flatMap(({ projects: teamProjects }) =>
                    teamProjects.map(p => <ChatProjectRow key={p.id} project={p} />)
                  )}
                </div>
              )}

              {projects.length === 0 && !projLoading && (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                  <MessageSquare size={24} className="text-[hsl(var(--sidebar-panel-foreground)/0.2)]" />
                  <p className="text-xs text-[hsl(var(--sidebar-panel-foreground)/0.4)]">No projects yet</p>
                </div>
              )}
            </nav>

          ) : activeRailTab === 'calendar' ? (
            <nav className="flex-1 overflow-y-auto p-3 space-y-4">
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                <CalendarDays size={20} className="text-[hsl(var(--sidebar-panel-active))]" />
                <p className="text-xs text-[hsl(var(--sidebar-panel-foreground)/0.5)]">View your task schedule in the main panel</p>
              </div>
            </nav>
          ) : activeRailTab === 'teams' ? (
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              <Link to="/teams">
                <button className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-[hsl(var(--sidebar-panel-foreground)/0.8)] hover:bg-[hsl(var(--sidebar-panel-muted))] hover:text-[hsl(var(--sidebar-panel-foreground))] transition-colors">
                  <Users size={14} className="shrink-0 text-[hsl(var(--sidebar-panel-active))]" />
                  <span>View & Manage Teams</span>
                </button>
              </Link>
            </nav>
          ) : activeRailTab === 'agents' ? (
            <nav className="flex-1 overflow-y-auto p-3 space-y-2">
              {agentsLoading ? (
                <p className="text-xs text-[hsl(var(--sidebar-panel-foreground)/0.4)] px-2 py-4 text-center">Loading agents...</p>
              ) : agents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 px-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--sidebar-panel-muted))]">
                    <Bot size={20} className="text-[hsl(var(--sidebar-panel-active))]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[hsl(var(--sidebar-panel-foreground))]">No agents yet</p>
                    <p className="text-[11px] text-[hsl(var(--sidebar-panel-foreground)/0.45)] mt-0.5">Click + to add your first agent</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {agents.map(agent => {
                    const assignedCount = agent.project_ids.length;
                    const isSelected = selectedAgent?.id === agent.id;
                    return (
                      <button
                        key={agent.id}
                        onClick={() => setSelectedAgent(isSelected ? null : agent)}
                        className={`w-full flex items-center gap-2.5 rounded-lg px-2 py-2 text-left text-[13px] transition-colors min-w-0 group ${
                          isSelected
                            ? 'bg-[hsl(var(--sidebar-panel-active-bg))] text-[hsl(var(--sidebar-panel-active))] border border-[hsl(var(--sidebar-panel-active)/0.4)]'
                            : 'text-[hsl(var(--sidebar-panel-foreground)/0.7)] hover:bg-[hsl(var(--sidebar-panel-muted))] hover:text-[hsl(var(--sidebar-panel-foreground))]'
                        }`}
                      >
                        <Bot size={14} className="shrink-0 opacity-60" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-[13px] font-medium leading-tight">{agent.display_name}</p>
                          <p className="text-[10px] opacity-50 truncate">
                            {assignedCount === 0 ? 'No projects' : `${assignedCount} project${assignedCount !== 1 ? 's' : ''}`}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </nav>
          ) : (
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              <button
                onClick={() => setShowProfile(true)}
                className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-[hsl(var(--sidebar-panel-foreground)/0.8)] hover:bg-[hsl(var(--sidebar-panel-muted))] hover:text-[hsl(var(--sidebar-panel-foreground))] transition-colors"
              >
                <Settings size={14} className="shrink-0 opacity-50" />
                <span>Profile Settings</span>
              </button>
            </nav>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {activeRailTab === 'calendar' ? (
          <CalendarView />

        ) : activeRailTab === 'chat' ? (
          /* ============ FULL-SCREEN CHAT MAIN AREA ============ */
          activeChatProject ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Chat header */}
              <header className="flex items-center gap-3 border-b border-border bg-card px-4 md:px-6 py-3 shrink-0">
                {isMobile && (
                  <button onClick={() => setSidebarOpen(true)} className="mr-1 text-muted-foreground hover:text-foreground">
                    <Menu size={20} />
                  </button>
                )}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--sidebar-panel-active)/0.12)] shrink-0">
                    <Hash size={16} className="text-[hsl(var(--sidebar-panel-active))]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-foreground truncate leading-tight">{activeChatProject.name}</h2>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                      {activeChatProject.type === 'team' ? <Users size={9} /> : <Lock size={9} />}
                      {activeChatProject.type === 'team' ? 'Team Channel' : 'Private Project'}
                    </span>
                  </div>
                </div>
              </header>
              <div className="flex flex-1 flex-col min-h-0">
                <ProjectChat projectId={activeChatProject.id} />
              </div>
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
              {isMobile && (
                <button onClick={() => setSidebarOpen(true)} className="absolute top-4 left-4 text-muted-foreground hover:text-foreground">
                  <Menu size={20} />
                </button>
              )}
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <MessageSquare size={32} className="text-muted-foreground" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-semibold text-foreground">Select a project to chat</p>
                <p className="text-sm text-muted-foreground">Choose a project from the sidebar to open its chat</p>
              </div>
            </div>
          )

        ) : activeRailTab === 'agents' ? (
          /* ============ AGENTS MAIN AREA ============ */
          selectedAgent ? (() => {
            const assignedProjects = projects.filter(p => selectedAgent.project_ids.includes(p.id));
            const supabaseProjectUrl = `https://pdzbejpiilgwgqhmbrso.supabase.co/functions/v1/api`;
            const exampleProjectId = selectedAgent.project_ids[0] || '<project-id>';
            const snippet = `curl -X GET "${supabaseProjectUrl}/tasks?project_id=${exampleProjectId}" \\
  -H "x-api-key: ${selectedAgent.key_prefix}..."

curl -X POST "${supabaseProjectUrl}/tasks" \\
  -H "x-api-key: ${selectedAgent.key_prefix}..." \\
  -H "Content-Type: application/json" \\
  -d '{"project_id":"${exampleProjectId}","title":"New task"}'

curl -X POST "${supabaseProjectUrl}/chat" \\
  -H "x-api-key: ${selectedAgent.key_prefix}..." \\
  -H "Content-Type: application/json" \\
  -d '{"project_id":"${exampleProjectId}","content":"Hello from agent"}'`;
            return (
              <div className="flex-1 overflow-y-auto px-6 py-8 max-w-2xl mx-auto w-full space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--sidebar-panel-active)/0.1)]">
                      <Bot size={24} className="text-[hsl(var(--sidebar-panel-active))]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{selectedAgent.display_name}</h2>
                      {selectedAgent.email && <p className="text-sm text-muted-foreground">{selectedAgent.email}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to="/docs">
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Info size={13} /> API Docs
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        try {
                          await deleteAgent(selectedAgent.id);
                          setSelectedAgent(null);
                          toast.success('Agent revoked');
                        } catch (err: any) {
                          toast.error(err.message);
                        }
                      }}
                      className="gap-1.5"
                    >
                      <Trash2 size={13} /> Revoke
                    </Button>
                  </div>
                </div>

                {/* Assigned Teams & Projects */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Teams & Projects</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                          <Plus size={12} /> Add to Projects
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3 space-y-2" align="end">
                        <p className="text-xs font-semibold text-foreground">Assign to projects</p>
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {projects.map(p => {
                            const isAssigned = selectedAgent.project_ids.includes(p.id);
                            const teamName = p.type === 'team' && p.team_id ? teams.find(t => t.id === p.team_id)?.name : null;
                            return (
                              <label key={p.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer text-sm">
                                <input
                                  type="checkbox"
                                  checked={isAssigned}
                                  onChange={async () => {
                                    const newIds = isAssigned
                                      ? selectedAgent.project_ids.filter(id => id !== p.id)
                                      : [...selectedAgent.project_ids, p.id];
                                    try {
                                      await updateAgentProjects(selectedAgent.id, newIds);
                                      setSelectedAgent({ ...selectedAgent, project_ids: newIds });
                                      toast.success('Updated');
                                    } catch (err: any) {
                                      toast.error(err.message);
                                    }
                                  }}
                                  className="rounded border-border"
                                />
                                <span className="flex items-center gap-1 truncate">
                                  {p.type === 'team' ? <Users size={10} className="shrink-0 opacity-50" /> : <Lock size={10} className="shrink-0 opacity-50" />}
                                  <span className="truncate">{p.name}</span>
                                  {teamName && <span className="text-[10px] text-muted-foreground ml-1">({teamName})</span>}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {assignedProjects.length > 0 ? (() => {
                    // Group assigned projects by team
                    const teamProjectGroups: { teamName: string | null; projects: typeof assignedProjects }[] = [];
                    const privateAssigned = assignedProjects.filter(p => p.type === 'private');
                    const teamAssigned = assignedProjects.filter(p => p.type === 'team');

                    if (privateAssigned.length > 0) {
                      teamProjectGroups.push({ teamName: null, projects: privateAssigned });
                    }

                    const teamMap = new Map<string, typeof assignedProjects>();
                    for (const p of teamAssigned) {
                      const tid = p.team_id || 'unknown';
                      if (!teamMap.has(tid)) teamMap.set(tid, []);
                      teamMap.get(tid)!.push(p);
                    }
                    for (const [tid, tProjects] of teamMap) {
                      const teamName = teams.find(t => t.id === tid)?.name || 'Unknown Team';
                      teamProjectGroups.push({ teamName, projects: tProjects });
                    }

                    return (
                      <div className="space-y-3">
                        {teamProjectGroups.map((group, i) => (
                          <div key={i} className="space-y-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                              {group.teamName ? <><Users size={9} /> {group.teamName}</> : <><Lock size={9} /> Private Projects</>}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {group.projects.map(p => (
                                <span key={p.id} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                                  <FolderOpen size={10} className="opacity-50" />
                                  {p.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })() : (
                    <p className="text-sm text-muted-foreground">No projects assigned. Click "Add to Projects" to get started.</p>
                  )}
                </div>

                <div className="rounded-xl border border-border bg-card p-4 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Created</p>
                  <p className="text-sm font-medium text-foreground">{format(new Date(selectedAgent.created_at), 'PP')}</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Key size={13} className="text-muted-foreground" />
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">API Key Prefix</p>
                  </div>
                  <code className="block text-sm font-mono text-foreground bg-muted rounded-lg px-3 py-2">
                    {selectedAgent.key_prefix}
                  </code>
                  <p className="text-[11px] text-muted-foreground">The full key was shown once at creation and cannot be retrieved again.</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Example Usage</p>
                    <button
                      onClick={() => { navigator.clipboard.writeText(snippet); toast.success('Copied!'); }}
                      className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Copy size={11} /> Copy
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono bg-muted rounded-lg p-3 overflow-x-auto text-foreground leading-relaxed whitespace-pre-wrap">{snippet}</pre>
                </div>
              </div>
            );
          })() : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Bot size={32} className="text-muted-foreground" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-semibold text-foreground">AI Agents</p>
                <p className="text-sm text-muted-foreground">Select an agent from the sidebar, or click + to create one.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setShowAddAgent(true); setAgentName(''); setAgentEmail(''); setAgentProjectIds([]); }}
                className="gap-1.5"
              >
                <Plus size={14} /> Add Agent
              </Button>
            </div>
          )

        ) : activeProject ? (
          /* ============ PROJECT TASKS VIEW ============ */
          <>
            <header className="flex items-center justify-between border-b border-border bg-card px-4 md:px-6 py-3">
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
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                      {activeProject.type === 'team' ? <Users size={9} /> : <Lock size={9} />}
                      {activeProject.type === 'team' ? 'Team' : 'Private'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tasks-only header (Chat moved to its own rail tab) */}
              <div className="flex items-center bg-muted rounded-lg p-0.5">
                <div className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold bg-card text-foreground shadow-sm">
                  <ListTodo size={13} /> Tasks
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
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
                  <form onSubmit={handleAddTask} className="w-full max-w-sm">
                    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                      <div className="flex items-center gap-0.5 px-2 pt-1.5 pb-0.5 border-b border-border/50">
                        <Plus size={14} className="text-muted-foreground shrink-0 mr-1" />
                        <FormattingToolbar textareaRef={taskInputRef} value={newTask} onChange={setNewTask} compact />
                        <div className="flex-1" />
                        <Button type="submit" size="sm" disabled={!newTask.trim()} className="rounded-lg px-4 h-7 text-xs">Add</Button>
                      </div>
                      <textarea
                        ref={taskInputRef}
                        placeholder="Enter a task..."
                        value={newTask}
                        onChange={e => setNewTask(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (newTask.trim()) handleAddTask(e);
                          }
                        }}
                        rows={4}
                        className="w-full text-sm border-0 shadow-none focus-visible:ring-0 bg-transparent outline-none px-3 py-2 text-foreground placeholder:text-muted-foreground resize-none min-h-[96px] max-h-[200px]"
                        autoFocus
                      />
                    </div>
                  </form>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => document.querySelector<HTMLInputElement>('input[placeholder="Add a task..."]')?.focus()}
                      className="text-sm font-semibold text-[hsl(var(--sidebar-panel-active))] hover:opacity-80 transition-opacity"
                    >
                      + Add Task
                    </button>
                  </div>
                  <div className="px-3">
                    <TaskList
                      tasks={tasks}
                      onCycle={cycleStatus}
                      onDelete={deleteTask}
                      onReorder={reorder}
                      onLogTime={handleLogTime}
                      taskMinutes={taskMinutes}
                      onRenameTask={renameTask}
                      onUpdateDueDate={updateDueDate}
                      onAssignTask={assignTask}
                      onUnassignTask={unassignTask}
                      projectId={activeProjectId}
                      teamId={activeProject?.team_id}
                    />
                  </div>
                </div>
              )}
            </div>
            {/* Floating task input */}
            <form onSubmit={handleAddTask} className="bg-card border-t border-border px-4 md:px-6 py-3">
              <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
                <div className="flex items-center gap-0.5 px-2 pt-1.5 pb-0.5 border-b border-border/50">
                  <Plus size={14} className="text-[hsl(var(--sidebar-panel-active))] shrink-0 mr-1" />
                  <FormattingToolbar textareaRef={taskInputRef} value={newTask} onChange={setNewTask} compact />
                  <div className="flex-1" />
                  <Button type="submit" size="sm" variant="ghost" className="shrink-0 rounded-lg h-7 px-3 text-[hsl(var(--sidebar-panel-active))] text-xs" disabled={!newTask.trim()}>
                    Add
                  </Button>
                </div>
                <textarea
                  ref={taskInputRef}
                  placeholder="Add a task..."
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (newTask.trim()) handleAddTask(e);
                    }
                  }}
                  rows={4}
                  className="w-full text-sm border-0 shadow-none focus-visible:ring-0 bg-transparent outline-none px-3 py-2 text-foreground placeholder:text-muted-foreground resize-none min-h-[96px] max-h-[200px]"
                />
              </div>
            </form>

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
          /* ============ HOME EMPTY STATE ============ */
          <div className="flex flex-1 flex-col items-center justify-center gap-3 relative">
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} className="absolute top-4 left-4 text-muted-foreground hover:text-foreground">
                <Menu size={20} />
              </button>
            )}
            <img src={agntfindLogo} alt="Agntive" className="h-20 w-20 mb-1 rounded-2xl shadow-sm" />
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Agntive</h1>
            <p className="text-sm text-muted-foreground">{projLoading ? 'Loading...' : 'Select or create a project to get started'}</p>
          </div>
        )}
      </main>

      <ProfileSheet open={showProfile} onOpenChange={setShowProfile} />
      <CreateProjectDialog open={showCreateProject} onOpenChange={setShowCreateProject} teams={teams} onCreate={handleCreateProject} />

      {/* ===== ADD AGENT DIALOG ===== */}
      <Dialog open={showAddAgent} onOpenChange={setShowAddAgent}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Bot size={18} /> Add AI Agent</DialogTitle>
            <DialogDescription>Create a project-scoped API key for your AI agent.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="agent-name">Agent Name <span className="text-destructive">*</span></Label>
              <Input
                id="agent-name"
                placeholder="e.g. Task Manager Bot"
                value={agentName}
                onChange={e => setAgentName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agent-email">Email <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                id="agent-email"
                type="email"
                placeholder="agent@example.com"
                value={agentEmail}
                onChange={e => setAgentEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Assign to Projects <span className="text-destructive">*</span></Label>
              <div className="rounded-md border border-input bg-background p-3 max-h-48 overflow-y-auto space-y-2">
                {projects.map(p => (
                  <label key={p.id} className="flex items-center gap-2.5 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={agentProjectIds.includes(p.id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setAgentProjectIds(prev => [...prev, p.id]);
                        } else {
                          setAgentProjectIds(prev => prev.filter(id => id !== p.id));
                        }
                      }}
                      className="rounded border-input h-4 w-4 accent-primary"
                    />
                    <span className="flex items-center gap-1.5">
                      {p.type === 'team' ? <Users size={12} /> : <Lock size={12} />}
                      {p.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAgent(false)}>Cancel</Button>
            <Button
              disabled={!agentName.trim() || agentProjectIds.length === 0 || agentCreating}
              onClick={async () => {
                setAgentCreating(true);
                try {
                  const result = await createAgent(agentName.trim(), agentProjectIds, agentEmail.trim() || undefined);
                  setShowAddAgent(false);
                  setNewKeyModal(result);
                } catch (err: any) {
                  toast.error(err.message);
                } finally {
                  setAgentCreating(false);
                }
              }}
            >
              {agentCreating ? 'Creating...' : 'Create Agent'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== NEW KEY REVEAL MODAL ===== */}
      {newKeyModal && (
        <Dialog open onOpenChange={() => setNewKeyModal(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-primary">
                <Key size={18} /> Agent Created — Save Your Key
              </DialogTitle>
              <DialogDescription>
                This is the <strong>only time</strong> you'll see this key. Copy it now and store it securely.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="rounded-xl bg-muted border border-border p-4 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Agent API Key</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono break-all text-foreground">{newKeyModal.rawKey}</code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(newKeyModal.rawKey); toast.success('Key copied!'); }}
                    className="shrink-0 flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground hover:bg-accent transition-colors"
                  >
                    <Copy size={12} /> Copy
                  </button>
                </div>
              </div>
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 flex gap-2">
                <span className="shrink-0">⚠️</span>
                <p className="text-[12px] text-destructive">
                  This key grants access to <strong>{newKeyModal.agent.project_ids.length} project{newKeyModal.agent.project_ids.length !== 1 ? 's' : ''}</strong>. Treat it like a password — it won't be shown again.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => { setNewKeyModal(null); setSelectedAgent(newKeyModal.agent); setActiveRailTab('agents'); }}>
                Done — View Agent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Index;

