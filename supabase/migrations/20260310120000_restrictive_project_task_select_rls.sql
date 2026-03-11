-- Harden against accidental over-broad SELECT policies.
-- Restrictive policies are ANDed with any existing permissive policies.

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Restrict projects to members" ON public.projects;
CREATE POLICY "Restrict projects to members"
  ON public.projects
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (public.is_project_member(auth.uid(), id));

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Restrict tasks to project members" ON public.tasks;
CREATE POLICY "Restrict tasks to project members"
  ON public.tasks
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (public.is_project_member(auth.uid(), project_id));

