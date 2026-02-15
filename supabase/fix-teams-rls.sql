-- =============================================================
-- FIX: Restore team visibility for owners and members
-- =============================================================
-- The previous migration may have created a conflicting SELECT
-- policy on the teams table. This script safely drops all
-- SELECT policies on teams and recreates a single correct one.
-- =============================================================

-- Step 1: Drop any existing SELECT policies on teams
-- (safe to run even if they don't exist)
DROP POLICY IF EXISTS "Users can read teams they are invited to" ON public.teams;
DROP POLICY IF EXISTS "Users can read teams they belong to or are invited to" ON public.teams;
DROP POLICY IF EXISTS "Users can read own teams" ON public.teams;
DROP POLICY IF EXISTS "Team members can view teams" ON public.teams;
DROP POLICY IF EXISTS "Authenticated users can read teams" ON public.teams;
DROP POLICY IF EXISTS "Users can view their teams" ON public.teams;
DROP POLICY IF EXISTS "Enable read access for team members" ON public.teams;

-- Step 2: Make sure RLS is enabled
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Step 3: Create the correct SELECT policy
-- Covers three cases:
--   a) User owns the team
--   b) User is a member of the team (via team_members table)
--   c) User has a pending invite to the team (for accept/decline UI)
CREATE POLICY "Users can read teams they belong to or are invited to"
  ON public.teams FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR public.is_team_member(id, auth.uid())
    OR id IN (
      SELECT team_id
      FROM public.team_invites
      WHERE lower(email) = lower(auth.jwt() ->> 'email')
        AND status = 'pending'
    )
  );
