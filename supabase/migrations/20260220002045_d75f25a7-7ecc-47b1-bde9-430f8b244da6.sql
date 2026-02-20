-- Add position column to projects for drag-and-drop ordering
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0;

-- Initialize positions based on created_at order within each owner/team group
WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (PARTITION BY owner_id, COALESCE(team_id::text, 'private') ORDER BY created_at) - 1 AS rn
  FROM public.projects
)
UPDATE public.projects p SET position = r.rn FROM ranked r WHERE p.id = r.id;
