-- Allow project creation and management. The restrictive policy "Restrict projects to members"
-- only applies to SELECT; we need explicit permissive policies for INSERT/UPDATE/DELETE so
-- authenticated users can create projects (as owner) and manage their own.

-- INSERT: creator must be owner; for team projects they must be a member of that team
CREATE POLICY "Users can create projects as owner"
  ON public.projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND (
      team_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = projects.team_id
          AND tm.user_id = auth.uid()
      )
    )
  );

-- UPDATE: only project owner can update
CREATE POLICY "Owners can update own projects"
  ON public.projects
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- DELETE: only project owner can delete
CREATE POLICY "Owners can delete own projects"
  ON public.projects
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());
