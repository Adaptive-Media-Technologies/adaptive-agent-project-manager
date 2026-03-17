-- Bypass RETURNING RLS: insert runs as the user (INSERT policies apply), but we return
-- the row from inside the function so the client gets it without the restrictive SELECT.

CREATE OR REPLACE FUNCTION public.create_project(
  p_name text,
  p_type text DEFAULT 'private',
  p_team_id uuid DEFAULT NULL,
  p_position integer DEFAULT 0
)
RETURNS public.projects
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id uuid := auth.uid();
  v_id uuid;
  v_row public.projects;
BEGIN
  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_type = 'team' AND p_team_id IS NOT NULL THEN
    IF NOT public.can_create_project_for_team(p_team_id, v_owner_id) THEN
      RAISE EXCEPTION 'Not allowed to create project for this team' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  INSERT INTO public.projects (name, owner_id, type, team_id, position)
  VALUES (p_name, v_owner_id, p_type, p_team_id, p_position)
  RETURNING id INTO v_id;

  SELECT * INTO v_row FROM public.projects WHERE id = v_id;
  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_project(text, text, uuid, integer) TO authenticated;
