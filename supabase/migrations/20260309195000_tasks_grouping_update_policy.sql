-- Allow project members to persist task grouping + ordering changes.
-- Without this, UPDATEs can be silently filtered by RLS (0 rows affected),
-- causing drag/drop to "revert" after navigation/refresh.

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can update task grouping" ON public.tasks;
CREATE POLICY "Members can update task grouping"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (public.is_project_member(auth.uid(), project_id))
  WITH CHECK (public.is_project_member(auth.uid(), project_id));

