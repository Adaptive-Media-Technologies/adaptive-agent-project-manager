-- ============================================================
-- Run this ENTIRE script in Supabase Dashboard > SQL Editor.
-- Copy ALL result sets and NOTICEs and paste them back for analysis.
-- ============================================================

-- 1) All RLS policies on projects
SELECT '1_policies' AS step, policyname, permissive, cmd, qual::text AS using_expr, with_check::text AS with_check_expr
FROM pg_policies
WHERE tablename = 'projects' AND schemaname = 'public'
ORDER BY cmd, policyname;

-- 2) is_project_member: exists and argument order
SELECT '2_is_project_member' AS step, pg_get_function_arguments(p.oid) AS args, prosrc AS body
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'is_project_member';

-- 3) can_create_project_for_team: exists and argument order
SELECT '3_can_create_project_for_team' AS step, pg_get_function_arguments(p.oid) AS args, prosrc AS body
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'can_create_project_for_team';

-- 4) Damien user id and BTBA team id
SELECT '4_damien' AS step, u.id AS damien_user_id, u.email FROM auth.users u WHERE lower(u.email) = 'damien@adaptivemedia.com.au';
SELECT '4_btba' AS step, t.id AS btba_team_id, t.name, t.owner_id AS btba_owner_id FROM public.teams t WHERE t.name = 'BTBA';

-- 5) Test: can Damien create for BTBA? (can_create_project_for_team(team_id, user_id))
SELECT '5_can_create_test' AS step,
  public.can_create_project_for_team(t.id, u.id) AS can_create_result,
  u.id AS user_id,
  t.id AS team_id
FROM auth.users u
CROSS JOIN public.teams t
WHERE lower(u.email) = 'damien@adaptivemedia.com.au' AND t.name = 'BTBA';

-- 6) Test: is Damien "member" of one of his own projects? (is_project_member(user_id, project_id))
SELECT '6_is_member_test' AS step,
  p.id AS project_id,
  p.owner_id,
  public.is_project_member(u.id, p.id) AS is_member_result
FROM auth.users u
CROSS JOIN LATERAL (SELECT id, owner_id FROM public.projects WHERE owner_id = u.id LIMIT 1) p
WHERE lower(u.email) = 'damien@adaptivemedia.com.au';

-- 7) If no project owned by Damien, show any project and manual is_project_member(damien_id, that_id)
SELECT '7_fallback_member_test' AS step,
  (SELECT id FROM auth.users WHERE lower(email) = 'damien@adaptivemedia.com.au' LIMIT 1) AS damien_id,
  (SELECT id FROM public.projects LIMIT 1) AS some_project_id,
  public.is_project_member(
    (SELECT id FROM auth.users WHERE lower(email) = 'damien@adaptivemedia.com.au' LIMIT 1),
    (SELECT id FROM public.projects LIMIT 1)
  ) AS is_member_result;
