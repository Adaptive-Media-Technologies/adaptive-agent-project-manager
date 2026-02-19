import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type Task = {
  id: string;
  project_id: string;
  title: string;
  status: 'open' | 'in_progress' | 'complete';
  position: number;
  completed_at: string | null;
  created_at: string;
  due_date: string | null;
};

export type Project = {
  id: string;
  name: string;
  owner_id: string;
  type: 'private' | 'team';
  team_id: string | null;
  created_at: string;
};

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('projects').select('*').order('created_at');
    setProjects((data as Project[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (name: string, type: 'private' | 'team' = 'private', teamId?: string) => {
    if (!user) return;
    const insert: any = { name, owner_id: user.id, type };
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

  return { projects, loading, create, rename, refresh: fetch };
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

  return { tasks, loading, addTask, cycleStatus, reorder, deleteTask, renameTask, updateDueDate, refresh: fetch };
};
