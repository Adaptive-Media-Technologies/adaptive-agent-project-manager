import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProjects, useTasks } from '@/hooks/useTasks';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TaskList from '@/components/TaskList';
import { Plus, LogOut, FolderPlus, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { format } from 'date-fns';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { projects, loading: projLoading, create: createProject } = useProjects();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const { tasks, loading: tasksLoading, addTask, cycleStatus, reorder, deleteTask } = useTasks(activeProjectId);
  const { logTime, taskMinutes } = useTimeEntries(activeProjectId);
  const [newTask, setNewTask] = useState('');
  const [newProject, setNewProject] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const activeProject = projects.find(p => p.id === activeProjectId);

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

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.trim()) return;
    try {
      const p = await createProject(newProject.trim());
      setNewProject('');
      if (p) setActiveProjectId(p.id);
    } catch (err: any) {
      toast.error(err.message);
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

  const openCount = tasks.filter(t => t.status === 'open').length;
  const doingCount = tasks.filter(t => t.status === 'in_progress').length;
  const doneCount = tasks.filter(t => t.status === 'complete').length;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h1 className="text-sm font-semibold text-foreground">Projects</h1>
          <button onClick={signOut} className="text-muted-foreground hover:text-foreground" title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => setActiveProjectId(p.id)}
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                p.id === activeProjectId ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {p.name}
            </button>
          ))}
        </nav>
        <form onSubmit={handleAddProject} className="border-t border-border p-2">
          <div className="flex gap-1">
            <Input placeholder="New project" value={newProject} onChange={e => setNewProject(e.target.value)} className="h-8 text-sm" />
            <Button type="submit" size="icon" variant="ghost" className="h-8 w-8 shrink-0">
              <FolderPlus size={14} />
            </Button>
          </div>
        </form>
      </aside>

      {/* Main */}
      <main className="flex flex-1 flex-col">
        {activeProject ? (
          <>
            <header className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">{activeProject.name}</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowDetails(true)} title="Project details">
                <Info size={16} />
              </Button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {tasksLoading ? (
                <p className="text-sm text-muted-foreground">Loading tasks...</p>
              ) : tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks yet. Add one below.</p>
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

            {/* Project Details Sheet */}
            <Sheet open={showDetails} onOpenChange={setShowDetails}>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>{activeProject.name}</SheetTitle>
                  <SheetDescription>Project details</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm text-foreground">{format(new Date(activeProject.created_at), 'PPP')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tasks Summary</p>
                    <div className="mt-1 flex gap-3 text-sm">
                      <span className="text-muted-foreground">Open: {openCount}</span>
                      <span className="text-primary">Doing: {doingCount}</span>
                      <span className="text-green-600">Done: {doneCount}</span>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground">{projLoading ? 'Loading...' : 'Select or create a project'}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
