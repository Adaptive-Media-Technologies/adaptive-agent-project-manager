
# Fix: Invited Users Can't See Projects After Signing Up

## Problem

When a user is invited to a team, signs up, and logs in, they don't see the team's projects. This is caused by two issues:

1. **RLS blocks invite visibility** -- The new user likely cannot read their pending invites from the `team_invites` table (and possibly the joined `teams` table) due to Row Level Security policies not accounting for email-based lookups by newly registered users.

2. **No automatic team join** -- Even if invites were visible, the current flow requires the user to manually find and click "Accept" in the sidebar. A newly signed-up user who was invited before registration won't intuitively know to do this.

## Solution

### Part 1: Database Changes (SQL to run in Supabase)

Add or fix RLS policies so authenticated users can read their own invites by email, and auto-join teams on signup.

```sql
-- 1. Allow authenticated users to read their own pending invites by email
CREATE POLICY "Users can read own invites"
  ON public.team_invites FOR SELECT
  TO authenticated
  USING (lower(email) = lower(auth.jwt() ->> 'email'));

-- 2. Allow authenticated users to update their own invites (accept/decline)
CREATE POLICY "Users can update own invites"
  ON public.team_invites FOR UPDATE
  TO authenticated
  USING (lower(email) = lower(auth.jwt() ->> 'email'));

-- 3. Ensure team_invites RLS is enabled
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- 4. Allow users to read teams they are invited to (for the join query)
-- (Only if not already covered by existing policies)
CREATE POLICY "Users can read teams they are invited to"
  ON public.teams FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT team_id FROM public.team_invites
      WHERE lower(email) = lower(auth.jwt() ->> 'email')
      AND status = 'pending'
    )
    OR public.is_team_member(id, auth.uid())
  );

-- 5. Auto-accept pending invites on signup via a trigger function
CREATE OR REPLACE FUNCTION public.handle_pending_invites()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add user to all teams they were invited to
  INSERT INTO public.team_members (team_id, user_id, role)
  SELECT team_id, NEW.id, 'member'
  FROM public.team_invites
  WHERE lower(email) = lower(NEW.email)
    AND status = 'pending';

  -- Mark those invites as accepted
  UPDATE public.team_invites
  SET status = 'accepted'
  WHERE lower(email) = lower(NEW.email)
    AND status = 'pending';

  RETURN NEW;
END;
$$;

-- 6. Trigger on profile creation (fires when a new user signs up)
CREATE TRIGGER on_profile_created_accept_invites
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_pending_invites();
```

Note: You may need to check for duplicate/conflicting RLS policies on `team_invites` and `teams` first. If existing SELECT policies exist, you may need to drop and replace them.

### Part 2: Code Changes

**File: `src/hooks/useTeamInvites.ts`**
- Use case-insensitive email matching by lowercasing the email before querying
- Add a null guard for `user.email`

**File: `src/hooks/useTeams.ts`**
- Call `refresh()` on teams after accepting an invite so the sidebar updates immediately

**File: `src/pages/Index.tsx`**
- After accepting an invite, refresh both teams and projects so the sidebar reflects the new team and its projects without needing a page reload

### Part 3: Profile Trigger Fix

The `handle_pending_invites` trigger needs access to the user's email. The `profiles` table may not store email. If that's the case, the trigger should instead be placed on `auth.users` or the function should look up the email from `auth.users`:

```sql
-- Alternative: Use auth.users email lookup
CREATE OR REPLACE FUNCTION public.handle_pending_invites()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;

  INSERT INTO public.team_members (team_id, user_id, role)
  SELECT team_id, NEW.id, 'member'
  FROM public.team_invites
  WHERE lower(email) = lower(user_email)
    AND status = 'pending'
  ON CONFLICT DO NOTHING;

  UPDATE public.team_invites
  SET status = 'accepted'
  WHERE lower(email) = lower(user_email)
    AND status = 'pending';

  RETURN NEW;
END;
$$;
```

## Expected Result

After these changes:
- A user who is invited and then signs up will be **automatically added to the team** -- no manual accept needed
- Their sidebar will immediately show the team and its projects upon login
- Existing invite UI still works for users who were already registered when invited
