-- Step 8: Check who owns is_project_member and whether that role bypasses RLS.
-- If the owner does NOT bypass RLS, the function's internal SELECT FROM projects
-- is subject to RLS and may not see the newly inserted row during RETURNING.

SELECT
  p.proname AS function_name,
  r.rolname AS owner_name,
  r.rolbypassrls AS owner_bypasses_rls
FROM pg_proc p
JOIN pg_roles r ON r.oid = p.proowner
WHERE p.proname = 'is_project_member'
  AND p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
