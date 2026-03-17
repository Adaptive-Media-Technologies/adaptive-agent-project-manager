-- Run this in Supabase Dashboard > SQL Editor to verify damien@adaptivemedia.com.au and BTBA.
-- Copy results and share if you want to confirm DB state.

-- 1) User id for damien@adaptivemedia.com.au (from auth.users)
SELECT id AS user_id, email
FROM auth.users
WHERE lower(email) = 'damien@adaptivemedia.com.au';

-- 2) BTBA team id and owner
SELECT id AS team_id, name, owner_id
FROM public.teams
WHERE name = 'BTBA';

-- 3) Team members for BTBA (user_id and whether they are in team_members)
SELECT tm.team_id, tm.user_id, tm.role, p.display_name, au.email
FROM public.team_members tm
JOIN public.teams t ON t.id = tm.team_id
LEFT JOIN public.profiles p ON p.id = tm.user_id
LEFT JOIN auth.users au ON au.id = tm.user_id
WHERE t.name = 'BTBA';

-- 4) Is damien owner or member of BTBA? (run after you have user_id and team_id from above, or use a single query)
SELECT
  u.id AS user_id,
  u.email,
  t.id AS team_id,
  t.name AS team_name,
  (t.owner_id = u.id) AS is_owner,
  EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = t.id AND tm.user_id = u.id) AS is_member
FROM auth.users u
CROSS JOIN public.teams t
WHERE lower(u.email) = 'damien@adaptivemedia.com.au'
  AND t.name = 'BTBA';
