-- =============================================================
-- COMPREHENSIVE FIX: Restore team visibility
-- =============================================================
-- Run this ENTIRE script in Cloud View > Run SQL
-- =============================================================

-- Step 1: Ensure is_team_member function exists and works
CREATE OR REPLACE FUNCTION public.is_team_member(_team_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members
    WHERE team_id = _team_id
      AND user_id = _user_id
  );
$$;

-- Step 2: Drop ALL possible SELECT policies on teams
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'teams'
      AND schemaname = 'public'
      AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.teams', pol.policyname);
    RAISE NOTICE 'Dropped policy: %', pol.policyname;
  END LOOP;
END $$;

-- Step 3: Make sure RLS is enabled
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Step 4: Create the correct SELECT policy
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

-- Step 5: Verify - this should show exactly 1 SELECT policy
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'teams' AND schemaname = 'public'
ORDER BY cmd, policyname;
