
-- Fix: Change team_members INSERT policies from RESTRICTIVE to PERMISSIVE
-- Currently both are RESTRICTIVE, meaning ALL must pass (impossible for non-owners with invites)

-- Drop existing restrictive INSERT policies
DROP POLICY IF EXISTS "Team owners can add members" ON public.team_members;
DROP POLICY IF EXISTS "Users can join teams they are invited to" ON public.team_members;

-- Recreate as PERMISSIVE (any one passing is sufficient)
CREATE POLICY "Team owners can add members"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    (EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_members.team_id AND teams.owner_id = auth.uid()
    ))
    OR (user_id = auth.uid())
  );

CREATE POLICY "Users can join teams they are invited to"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    (user_id = auth.uid())
    AND has_pending_team_invite(team_id, (auth.jwt() ->> 'email'::text))
  );
