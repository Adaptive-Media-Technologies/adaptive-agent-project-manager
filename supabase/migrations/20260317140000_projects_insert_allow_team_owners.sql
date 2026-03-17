-- Allow team owners to create team projects (they may not be in team_members).
-- Use SECURITY DEFINER so the check is not blocked by RLS on teams/team_members.

CREATE OR REPLACE FUNCTION public.can_create_project_for_team(_team_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.team_members WHERE team_id = _team_id AND user_id = _user_id)
  OR EXISTS (SELECT 1 FROM public.teams WHERE id = _team_id AND owner_id = _user_id);
$$;

DROP POLICY IF EXISTS "Users can create projects as owner" ON public.projects;

CREATE POLICY "Users can create projects as owner"
  ON public.projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND (
      team_id IS NULL
      OR public.can_create_project_for_team(projects.team_id, auth.uid())
    )
  );
