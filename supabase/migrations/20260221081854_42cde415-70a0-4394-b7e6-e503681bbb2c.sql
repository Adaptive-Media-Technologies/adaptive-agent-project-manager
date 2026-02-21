
-- 1. Create junction table
CREATE TABLE public.agent_projects (
  agent_id   uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (agent_id, project_id)
);

-- 2. Enable RLS
ALTER TABLE public.agent_projects ENABLE ROW LEVEL SECURITY;

-- 3. RLS: agent owners can manage assignments
CREATE POLICY "Agent owners manage assignments"
ON public.agent_projects
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.agents WHERE agents.id = agent_projects.agent_id AND agents.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.agents WHERE agents.id = agent_projects.agent_id AND agents.owner_id = auth.uid()
  )
);

-- 4. Migrate existing data
INSERT INTO public.agent_projects (agent_id, project_id)
SELECT id, project_id FROM public.agents WHERE project_id IS NOT NULL;

-- 5. Drop the foreign key and column
ALTER TABLE public.agents DROP COLUMN project_id;
