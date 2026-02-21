

# Multi-Project Agents: One Key, Many Projects

## Current Problem
Each agent row has a single `project_id`. To use the same agent across 3 projects, you need 3 agent records and 3 separate API keys.

## New Design
Decouple projects from the agent record using a junction table. An agent gets one identity and one key, then is assigned to any number of projects.

```text
agents (identity + key)          agent_projects (assignments)
--------------------------       ----------------------------
id                         <--   agent_id
owner_id                         project_id
display_name                     assigned_at
email
key_hash
key_prefix
created_at
```

## Database Changes

### 1. New junction table: `agent_projects`
```sql
CREATE TABLE public.agent_projects (
  agent_id   uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (agent_id, project_id)
);
-- RLS: owners of the agent can manage assignments
```

### 2. Migrate existing data
Move every existing `agents.project_id` into the new junction table, then drop the column from `agents`.

```sql
INSERT INTO public.agent_projects (agent_id, project_id)
SELECT id, project_id FROM public.agents WHERE project_id IS NOT NULL;

ALTER TABLE public.agents DROP COLUMN project_id;
```

## Edge Function Changes (`supabase/functions/api/index.ts`)

When an agent key is resolved:
- Query `agent_projects` to get the list of allowed project IDs for that agent
- Replace the single `scopedProjectId` variable with an array `scopedProjectIds`
- Scope check becomes: if the array is non-empty and the requested `project_id` is not in it, return 403

## Hook Changes (`src/hooks/useAgents.ts`)

- Update the `Agent` interface: replace `project_id: string` with `project_ids: string[]` (fetched via a join or separate query on `agent_projects`)
- `createAgent` accepts an array of project IDs and inserts rows into `agent_projects` after creating the agent
- Add an `updateAgentProjects(agentId, projectIds[])` function to add/remove project assignments

## UI Changes (`src/pages/Index.tsx`)

- "Add Agent" dialog: change the project dropdown to a multi-select (checkboxes for each project)
- Agent detail view: show all assigned projects as badges, with ability to add/remove projects after creation
- Agent sidebar list: show project count badge instead of a single project name

## Docs Update (`src/pages/Docs.tsx`)

- Update the authentication section to note that agent keys can be scoped to multiple projects
- Clarify that the agent can access any of its assigned projects with the same key

## Files to Change

| File | Change |
|---|---|
| `supabase/migrations/...sql` | Create `agent_projects` table, migrate data, drop `project_id` from `agents` |
| `supabase/functions/api/index.ts` | Replace single `scopedProjectId` with array lookup from `agent_projects` |
| `src/hooks/useAgents.ts` | Multi-project support in create/fetch/update |
| `src/pages/Index.tsx` | Multi-select project picker in dialogs, multi-project display in detail view |
| `src/pages/Docs.tsx` | Update agent scoping docs |

