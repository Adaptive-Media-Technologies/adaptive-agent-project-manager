-- Table to track the last time a user read each project's chat
CREATE TABLE IF NOT EXISTS public.project_last_read (
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, project_id)
);

ALTER TABLE public.project_last_read ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own last-read markers
CREATE POLICY "Users manage own last_read"
  ON public.project_last_read FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
