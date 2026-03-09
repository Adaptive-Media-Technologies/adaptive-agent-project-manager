-- Task Groups (Monday-style sections) per project

-- 1) Create task_groups table
CREATE TABLE IF NOT EXISTS public.task_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Add group_id to tasks
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES public.task_groups(id) ON DELETE SET NULL;

-- 3) Enable RLS
ALTER TABLE public.task_groups ENABLE ROW LEVEL SECURITY;

-- 4) RLS policies (mirror project membership behavior used elsewhere)
CREATE POLICY "Members can view task groups"
  ON public.task_groups FOR SELECT
  USING (public.is_project_member(auth.uid(), project_id));

CREATE POLICY "Members can create task groups"
  ON public.task_groups FOR INSERT
  WITH CHECK (public.is_project_member(auth.uid(), project_id));

CREATE POLICY "Members can update task groups"
  ON public.task_groups FOR UPDATE
  USING (public.is_project_member(auth.uid(), project_id))
  WITH CHECK (public.is_project_member(auth.uid(), project_id));

CREATE POLICY "Members can delete task groups"
  ON public.task_groups FOR DELETE
  USING (public.is_project_member(auth.uid(), project_id));

-- 5) Indexes
CREATE INDEX IF NOT EXISTS idx_task_groups_project_position
  ON public.task_groups(project_id, position);

CREATE INDEX IF NOT EXISTS idx_tasks_group_id
  ON public.tasks(group_id);

