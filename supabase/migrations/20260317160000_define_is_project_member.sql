-- Define is_project_member so the restrictive SELECT policy allows the creator to see the new row.
-- All call sites use is_project_member(auth.uid(), project_id) i.e. (user_id, project_id).
-- Return true if user is project owner, or (team project and user is in team_members or is team owner).
-- SECURITY DEFINER so the check is not blocked by RLS on projects/teams/team_members.

CREATE OR REPLACE FUNCTION public.is_project_member(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = _project_id
      AND (
        p.owner_id = _user_id
        OR (
          p.team_id IS NOT NULL
          AND (
            EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = p.team_id AND tm.user_id = _user_id)
            OR EXISTS (SELECT 1 FROM public.teams t WHERE t.id = p.team_id AND t.owner_id = _user_id)
          )
        )
      )
  );
$$;
