

# Simple Task Assignment with @mention Picker

## Summary
Add a lightweight assignee field to the task detail drawer. Users type `@` to search and select a team member or AI agent by name. The assigned person/agent shows as an avatar chip on both the detail drawer and the task row.

---

## Database Changes

**Migration**: Add two columns to `tasks`:

```text
assigned_to    uuid   nullable   -- references a profile ID or agent ID
assigned_type  text   nullable   -- 'user' or 'agent'
```

No foreign keys (polymorphic reference). No new tables.

---

## Hook Changes (`src/hooks/useTasks.ts`)

- Extend the `Task` type with `assigned_to` and `assigned_type`
- Add `assignTask(taskId, assigneeId, type)` -- updates both columns
- Add `unassignTask(taskId)` -- sets both to null

---

## UI Changes

### Task Detail Drawer (`TaskDetailDialog.tsx`)

Add an **Assignee** row between the Status/Time section and the Dates section:

- Shows current assignee as an avatar + name chip (with an "x" to unassign)
- If unassigned, shows an input field with placeholder "Type @ to assign..."
- Typing `@` triggers a dropdown list filtered by keystroke:
  - **Team members**: fetched from `team_members` + `profiles` for the project's team
  - **AI agents**: fetched from `agent_projects` + `agents` for this project
  - Each entry shows avatar/Bot icon + display name
- Selecting an entry calls `assignTask()` with optimistic update
- For private projects: shows just the owner + any assigned agents

### Task Row (`TaskItem.tsx`)

- When assigned, show a small avatar (user) or Bot icon (agent) next to the task title
- Remove the always-visible "Agent" badge; instead show it only when `assigned_type === 'agent'`
- Unassigned tasks show no avatar

---

## Technical Details

### Migration SQL

```text
ALTER TABLE public.tasks
  ADD COLUMN assigned_to uuid,
  ADD COLUMN assigned_type text;
```

### Assignee lookup queries

**Team members** (for team projects):
```text
supabase.from('team_members')
  .select('user_id, profiles!team_members_user_id_profiles_fkey(id, display_name, avatar_url)')
  .eq('team_id', project.team_id)
```

**Agents** (for any project):
```text
supabase.from('agent_projects')
  .select('agent_id, agents(id, display_name)')
  .eq('project_id', projectId)
```

### Assignee input behavior

1. User clicks the assignee area or starts typing
2. Typing `@` (or any character) filters the combined list of members + agents
3. Arrow keys + Enter or click to select
4. Selection calls `assignTask(taskId, id, 'user' | 'agent')`
5. Chip appears with name + avatar; clicking "x" calls `unassignTask()`

### Props changes

- `TaskDetailDialog` receives `projectId` (to query assignees) and the project's `team_id`
- `TaskItem` receives `assigneeName` and `assigneeType` (resolved by parent) to display inline

### Files to modify

| File | Change |
|---|---|
| New migration | Add 2 columns to `tasks` |
| `src/hooks/useTasks.ts` | Extend Task type, add assign/unassign functions |
| `src/components/TaskDetailDialog.tsx` | Add assignee row with @mention input + dropdown |
| `src/components/TaskItem.tsx` | Show assignee avatar/icon inline, conditional Agent badge |
| `src/components/TaskList.tsx` | Pass project context + assignee display data to children |

