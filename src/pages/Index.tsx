import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProjects, useTasks } from '@/hooks/useTasks';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TaskItem from '@/components/TaskItem';
import { Plus, LogOut, FolderPlus } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { projects, loading: projLoading, create: createProject } = useProjects();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const { tasks, loading: tasksLoading, addTask, cycleStatus, deleteTask } = useTasks(activeProjectId);
  const [newTask, setNewTask] = useState('');
  const [newProject, setNewProject] = useState('');

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
            <header className="border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">{activeProject.name}</h2>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
              {tasksLoading ? (
                <p className="text-sm text-muted-foreground">Loading tasks...</p>
              ) : tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks yet. Add one below.</p>
              ) : (
                tasks.map(t => (
                  <TaskItem key={t.id} task={t} onCycle={() => cycleStatus(t)} onDelete={() => deleteTask(t.id)} />
                ))
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
