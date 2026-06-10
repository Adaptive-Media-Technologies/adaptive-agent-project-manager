## Goal
Give `kath@adaptivemedia.com.au` access to TEAM KATH and PROJECT KATH.

## Findings
- User id: `84495bd0-171e-445c-bf5e-1729a62b0fdb`
- Team KATH id: `42723671-0e59-45e8-aa6e-407c66e849a7`
- Project KATH id: `5e80d4b2-1f52-4f38-ba71-622e4a199297` — type `team`, already linked to team KATH

Because PROJECT KATH is a team project, project access is governed by team membership (`is_project_member` / `is_project_team_member`). Adding Kath to the team is sufficient — no extra project row required.

## Change
One insert into `public.team_members`:

```sql
INSERT INTO public.team_members (team_id, user_id, role)
VALUES (
  '42723671-0e59-45e8-aa6e-407c66e849a7',
  '84495bd0-171e-445c-bf5e-1729a62b0fdb',
  'member'
)
ON CONFLICT (team_id, user_id) DO NOTHING;
```

## Verification
```sql
SELECT team_id, user_id, role
FROM public.team_members
WHERE team_id = '42723671-0e59-45e8-aa6e-407c66e849a7'
  AND user_id = '84495bd0-171e-445c-bf5e-1729a62b0fdb';
```

No schema migration and no code changes.
