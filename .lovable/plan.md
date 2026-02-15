

## Implementing Teams and Project Types

SQL is confirmed done. Now building the frontend to support teams, team invites, and private vs team projects.

### Changes Summary

**New files to create:**
- `src/hooks/useTeams.ts` -- Team CRUD, member management (fetch teams, create team, add/remove members)
- `src/hooks/useTeamInvites.ts` -- Fetch pending invites for current user, accept/decline, send invites
- `src/pages/Teams.tsx` -- Teams management page with team list, member view, and invite functionality
- `src/components/CreateProjectDialog.tsx` -- Dialog to create a project with Private/Team type selection and team dropdown

**Files to update:**
- `src/hooks/useTasks.ts` -- Add `type` and `team_id` fields to the `Project` type; update `create` function to accept type and team_id parameters
- `src/pages/Index.tsx` -- Sidebar groups projects into "My Projects" (private) and team sections; replace inline project creation with CreateProjectDialog; add nav link to Teams page; show pending invites banner
- `src/App.tsx` -- Add `/teams` route

### How it will look

**Sidebar:**
- "My Projects" section showing private projects
- One section per team showing that team's projects
- "+" button opens CreateProjectDialog (choose Private or Team + pick team)
- Link to Teams management page

**Teams page (`/teams`):**
- List of teams the user belongs to
- Each team shows members with avatars and a way to invite by email
- "Create Team" button
- Pending invites section at the top with Accept/Decline buttons

### Technical Details

- All new hooks follow the same pattern as existing ones (useState + useCallback + supabase queries)
- RLS handles all access control -- frontend simply queries and gets only what the user is allowed to see
- Team invites match by email so users can be invited before signing up
- The `is_project_member` and `is_team_member` DB functions (already created in SQL) ensure tasks, notes, and time entries are visible to team members automatically

