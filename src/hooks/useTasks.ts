import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type Task = {
  id: string;
  project_id: string;
  title: string;
  status: 'open' | 'in_progress' | 'complete' | 'archived';
  position: number;
  completed_at: string | null;
  created_at: string;
  created_by: string;
  due_date: string | null;
  assigned_to: string | null;
  assigned_type: 'user' | 'agent' | null;
};

export type Project = {
  id: string;
  name: string;
  owner_id: string;
  type: 'private' | 'team';
  team_id: string | null;
  created_at: string;
  position: number;
};

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('projects').select('*').order('position').order('created_at');
    setProjects((data as Project[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (name: string, type: 'private' | 'team' = 'private', teamId?: string) => {
    if (!user) return;
    // Determine position as max existing position + 1 within group
    const group = projects.filter(p => type === 'team' ? p.team_id === teamId : p.type === 'private');
    const position = group.length;
    const insert: any = { name, owner_id: user.id, type, position };
    if (type === 'team' && teamId) insert.team_id = teamId;
    const { data, error } = await supabase.from('projects').insert(insert).select().single();
    if (error) throw error;
    setProjects(p => [...p, data as Project]);
    return data as Project;
  };

  const rename = async (id: string, newName: string) => {
    const { error } = await supabase.from('projects').update({ name: newName }).eq('id', id);
    if (error) throw error;
    setProjects(p => p.map(pp => pp.id === id ? { ...pp, name: newName } : pp));
  };

  const reorderProjects = async (groupProjects: Project[], fromIndex: number, toIndex: number) => {
    const updated = [...groupProjects];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    const reordered = updated.map((p, i) => ({ ...p, position: i }));
    // Optimistic update
    setProjects(prev => {
      const ids = new Set(reordered.map(p => p.id));
      return [...prev.filter(p => !ids.has(p.id)), ...reordered].sort((a, b) => a.position - b.position);
    });
    await Promise.all(reordered.map(p => supabase.from('projects').update({ position: p.position }).eq('id', p.id)));
  };

  return { projects, loading, create, rename, reorderProjects, refresh: fetch };
};

export const useTasks = (projectId: string | null) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!projectId) { setTasks([]); setLoading(false); return; }
    const { data } = await supabase.from('tasks').select('*').eq('project_id', projectId).order('position');
    setTasks((data as Task[]) || []);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetch(); }, [fetch]);

  const addTask = async (title: string) => {
    if (!user || !projectId) return;
    const position = tasks.length;
    const { data, error } = await supabase.from('tasks')
      .insert({ title, project_id: projectId, created_by: user.id, position })
      .select().single();
    if (error) throw error;
    setTasks(t => [...t, data as Task]);
  };

  const cycleStatus = async (task: Task) => {
    const next = task.status === 'open' ? 'in_progress' : task.status === 'in_progress' ? 'complete' : 'open';
    // Optimistic
    setTasks(t => t.map(tt => tt.id === task.id ? { ...tt, status: next } as Task : tt));
    const { error } = await supabase.from('tasks').update({ status: next }).eq('id', task.id);
    if (error) fetch();
  };

  const archiveTask = async (id: string) => {
    const prev = [...tasks];
    setTasks(t => t.filter(tt => tt.id !== id));
    const { error } = await supabase.from('tasks').update({ status: 'archived' }).eq('id', id);
    if (error) {
      console.error('Archive failed:', error);
      setTasks(prev);
    }
  };

  const reorder = async (fromIndex: number, toIndex: number) => {
    const updated = [...tasks];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    const reordered = updated.map((t, i) => ({ ...t, position: i }));
    setTasks(reordered);
    // Batch update positions
    await Promise.all(reordered.map(t => supabase.from('tasks').update({ position: t.position }).eq('id', t.id)));
  };

  const deleteTask = async (id: string) => {
    setTasks(t => t.filter(tt => tt.id !== id));
    await supabase.from('tasks').delete().eq('id', id);
  };

  const renameTask = async (id: string, newTitle: string) => {
    const { error } = await supabase.from('tasks').update({ title: newTitle }).eq('id', id);
    if (error) throw error;
    setTasks(t => t.map(tt => tt.id === id ? { ...tt, title: newTitle } : tt));
  };

  const updateDueDate = async (id: string, dueDate: string | null) => {
    const { error } = await supabase.from('tasks').update({ due_date: dueDate }).eq('id', id);
    if (error) throw error;
    setTasks(t => t.map(tt => tt.id === id ? { ...tt, due_date: dueDate } : tt));
  };

  const assignTask = async (id: string, assigneeId: string, assigneeType: 'user' | 'agent') => {
    setTasks(t => t.map(tt => tt.id === id ? { ...tt, assigned_to: assigneeId, assigned_type: assigneeType } : tt));
    const { error } = await supabase.from('tasks').update({ assigned_to: assigneeId, assigned_type: assigneeType } as any).eq('id', id);
    if (error) fetch();
  };

  const unassignTask = async (id: string) => {
    setTasks(t => t.map(tt => tt.id === id ? { ...tt, assigned_to: null, assigned_type: null } : tt));
    const { error } = await supabase.from('tasks').update({ assigned_to: null, assigned_type: null } as any).eq('id', id);
    if (error) fetch();
  };

  // Filter out archived tasks from normal view
  const activeTasks = tasks.filter(t => t.status !== 'archived');

  return { tasks: activeTasks, loading, addTask, cycleStatus, reorder, deleteTask, renameTask, updateDueDate, assignTask, unassignTask, archiveTask, refresh: fetch };
};

export const useArchivedTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('tasks')
      .select('*, projects(name)')
      .eq('status', 'archived')
      .order('updated_at', { ascending: false });
    setTasks((data as any[])?.map(t => ({ ...t, project_name: t.projects?.name })) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const restoreTask = async (id: string) => {
    setTasks(t => t.filter(tt => tt.id !== id));
    await supabase.from('tasks').update({ status: 'open' }).eq('id', id);
  };

  const hardDelete = async (id: string) => {
    setTasks(t => t.filter(tt => tt.id !== id));
    await supabase.from('tasks').delete().eq('id', id);
  };

  return { tasks, loading, restoreTask, hardDelete, refresh: fetch };
};
