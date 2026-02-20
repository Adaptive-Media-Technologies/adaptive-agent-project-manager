
-- Create agents table for project-scoped AI agent API keys
CREATE TABLE public.agents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  email        text,
  project_id   uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  key_hash     text NOT NULL UNIQUE,
  key_prefix   text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Owners can fully manage their own agents
CREATE POLICY "Owners manage own agents"
  ON public.agents FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());
