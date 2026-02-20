
# AI Agent Access — Project-Scoped API Keys & Agent Management UI

## What We're Building

A complete Agent management system: users can create named AI agents, assign them to specific projects, and receive a one-time project-scoped API key the agent uses to CRUD tasks and post chat messages.

---

## How Agents Work Today (Current State)

Agents currently work as full Supabase auth users (like "Elara", "Selina") who sign up, get invited to teams, and use API keys tied to their `user_id`. This approach has problems:
- Agents have broad access to everything the user account can see
- Creating an agent requires a full signup flow (email, password, etc.)
- No visibility in the UI on which agents are doing what

---

## New Design: Project-Scoped Agent Records

Instead of creating new auth users, we introduce an `agents` table that stores lightweight agent identities owned by the human user. Each agent gets:
- A **display name** (e.g. "Task Bot")
- An optional **email** (for identification, not auth)
- A **project assignment** (which project they can access)
- A **hashed API key** (same `ak_` format, same edge function auth)

The existing `/api` edge function already authenticates via `x-api-key` → looks up `user_id` from `api_keys`. We extend this so that agent keys carry the **owner's** `user_id` for authorization purposes, scoped to only the assigned project.

---

## Architecture

```text
agents table
  id, owner_id (FK→profiles), display_name, email?, project_id (FK→projects), 
  key_hash, key_prefix, created_at

agent_key_lookup (view or join in edge fn)
  agent.key_hash → resolve owner_id + scoped project_id
```

When an agent calls the API:
1. Edge function finds the matching `agents` row by `key_hash`
2. Sets `userId = agent.owner_id` (so RLS/access checks work)
3. Sets `scopedProjectId = agent.project_id` (limits operations to that project only)
4. Any task/chat/note operation outside that project returns 403

---

## Database Changes

### New table: `agents`

```sql
CREATE TABLE public.agents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  email        text,
  project_id   uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  key_hash     text NOT NULL,
  key_prefix   text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Owners can fully manage their own agents
CREATE POLICY "Owners manage own agents"
  ON public.agents FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());
```

No new auth users are created. No `api_keys` table entries for agents — the `agents` table IS the key store.

---

## Edge Function Changes (`supabase/functions/api/index.ts`)

Extend the auth section to also check the `agents` table:

```typescript
// Auth resolution order:
// 1. x-api-key → check agents table (project-scoped)
// 2. x-api-key → check api_keys table (user-level, legacy)
// 3. Bearer JWT

let userId: string | null = null;
let scopedProjectId: string | null = null; // new — null means no restriction

if (apiKey) {
  const hashHex = await hashKey(apiKey);
  
  // Check agents first (project-scoped keys)
  const { data: agentRow } = await supabase
    .from('agents')
    .select('owner_id, project_id')
    .eq('key_hash', hashHex)
    .single();
    
  if (agentRow) {
    userId = agentRow.owner_id;
    scopedProjectId = agentRow.project_id; // restrict to this project only
  } else {
    // Fall back to user-level api_keys
    const { data: keyRow } = await supabase
      .from('api_keys')
      .select('user_id')
      .eq('key_hash', hashHex)
      .single();
    if (!keyRow) return json({ error: 'Invalid API key' }, 401);
    userId = keyRow.user_id;
  }
}
```

Then in each task/note/chat endpoint, if `scopedProjectId` is set, enforce it:
```typescript
// Guard on all write endpoints
if (scopedProjectId && project_id !== scopedProjectId) {
  return json({ error: 'Agent is scoped to a different project' }, 403);
}
```

Also add **Chat API endpoints** (missing today):
```
GET  /api/chat?project_id=xxx   — List recent messages
POST /api/chat                  — Send a message { project_id, content }
```

---

## New API Endpoints for Chat

```typescript
// GET /api/chat?project_id=xxx
if (path === '/chat' && method === 'GET') {
  const projectId = url.searchParams.get('project_id');
  if (!projectId) return json({ error: 'project_id required' }, 400);
  if (scopedProjectId && projectId !== scopedProjectId)
    return json({ error: 'Access denied' }, 403);
  if (!(await canAccessProject(projectId))) return json({ error: 'Access denied' }, 403);
  const { data, error } = await supabase
    .from('project_messages')
    .select('id, project_id, user_id, content, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(50);
  return json(data);
}

// POST /api/chat  { project_id, content }
if (path === '/chat' && method === 'POST') {
  const { project_id, content } = await req.json();
  if (!project_id || !content) return json({ error: 'project_id and content required' }, 400);
  if (scopedProjectId && project_id !== scopedProjectId)
    return json({ error: 'Access denied' }, 403);
  if (!(await canAccessProject(project_id))) return json({ error: 'Access denied' }, 403);
  const { data, error } = await supabase
    .from('project_messages')
    .insert({ project_id, user_id: userId, content })
    .select().single();
  return json(data, 201);
}
```

---

## UI: Agents Panel in Sidebar (`src/pages/Index.tsx`)

Replace the current "Coming Soon" placeholder in the Agents rail with a full management UI:

### Agent Panel (Level 2 sidebar)
- **Header**: "Agents" with a `+` button to open the "Add Agent" dialog
- **Agent list**: Each agent shown as a row with:
  - Bot icon + display name
  - Project name it's assigned to (small badge)
  - Kebab/trash icon to revoke/delete
  - Muted email if set

### "Add Agent" Dialog
A simple 3-field form:
1. **Agent Name** (required) — e.g. "Task Manager Bot"
2. **Email** (optional) — for identification only
3. **Assign to Project** (required) — dropdown of the user's projects

On submit:
- Generate `ak_` key
- Hash and store in `agents` table
- Show the raw key ONE TIME in a copy-to-clipboard modal with a warning ("Save this key — it won't be shown again")

### Main Area for Agents Rail
When `activeRailTab === 'agents'` and an agent is selected → show agent details:
- Name, email, assigned project
- API key prefix (e.g. `ak_1a2b3c4d...`)
- Code snippet showing how to call the API
- Created date
- **Revoke** button (deletes from `agents` table)

---

## Files to Change

| File | Change |
|---|---|
| `supabase/migrations/...sql` | Create `agents` table + RLS |
| `supabase/functions/api/index.ts` | Add agent auth path + chat endpoints + scope enforcement |
| `src/pages/Index.tsx` | Replace "Coming Soon" with agent list + "Add Agent" dialog |
| `src/hooks/useAgents.ts` | New hook — fetch/create/delete agents from `agents` table |

---

## Security Model

- Agent keys are project-scoped: even if leaked, they can only touch the one assigned project
- The key is hashed (SHA-256) at rest — same pattern as `api_keys`
- The raw key is shown once at creation, never retrievable again
- Deleting an agent immediately invalidates its key (row deleted = hash no longer matches)
- The agent acts as the **owner** for DB purposes — tasks it creates show `created_by = owner_id`

---

## User Flow (End to End)

1. User clicks **Bot icon** in rail → sees agent list (empty state on first visit)
2. Clicks **+** → "Add Agent" dialog opens
3. Fills in name, optional email, selects a project from dropdown
4. Clicks **Create** → key generated, stored hashed, raw key shown with copy button
5. User pastes key into their AI agent tool/framework
6. Agent calls `POST /api/chat` or `PATCH /api/tasks/:id` with `x-api-key: ak_...`
7. Agent appears in task's `created_by` profile as their display name

