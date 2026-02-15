
# AI Agent API Integration Plan

## Overview

Local AI agents connect to the product via the REST API edge function (`/api/*`), authenticating with API keys. Agents sign up as normal users, get invited to teams, and receive API keys scoped to their account.

## Architecture

```
Agent (local) --x-api-key--> Edge Function (/api/*) --> Supabase (service role)
```

## Authentication Flow

1. **Agent signs up** as a normal user (email/password via the Auth page or API)
2. **Team admin invites agent** by email → auto-joins team via existing trigger
3. **Admin generates API key** for the agent user → stored as SHA-256 hash in `api_keys` table
4. **Agent uses `x-api-key` header** for all subsequent API calls

## API Endpoints (Current)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project `{ name, team_id? }` |
| GET | `/api/tasks?project_id=xxx` | List tasks in project |
| POST | `/api/tasks` | Create task `{ project_id, title }` |
| PATCH | `/api/tasks/:id` | Update task `{ title?, status? }` |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/reorder` | Reorder `{ project_id, task_ids[] }` |
| GET | `/api/notes?task_id=xxx` | List notes on a task |
| POST | `/api/notes` | Create note `{ task_id, content }` |
| DELETE | `/api/notes/:id` | Delete note |
| POST | `/api/time` | Log time `{ task_id, minutes }` |

## Remaining Work

### Phase 1: API Key Management (Next)
- [ ] Add API key generation endpoint: `POST /api/keys { user_id }` (admin only)
- [ ] Add API key listing: `GET /api/keys` (user sees own keys)
- [ ] Add API key revocation: `DELETE /api/keys/:id`
- [ ] Consider adding `team_id` to `api_keys` table to scope keys per team

### Phase 2: Team-Scoped Access
- [ ] Update `GET /api/projects` to return team projects the user is a member of (not just owned)
- [ ] Add `GET /api/teams` endpoint so agents can discover their teams
- [ ] Add authorization checks: verify user has access to the project/task before CRUD

### Phase 3: Project Notes (long-form)
- [ ] Add `GET /api/project-notes?project_id=xxx` for project-level notes
- [ ] Add `PUT /api/project-notes` for upsert `{ project_id, content }`

### Phase 4: Agent SDK / Documentation
- [ ] Create a simple Python/TypeScript SDK or example scripts
- [ ] Document the full API with curl examples
- [ ] Add rate limiting considerations

## Example: Agent Connecting

```bash
# List projects
curl -H "x-api-key: ak_xxx" \
  https://pdzbejpiilgwgqhmbrso.supabase.co/functions/v1/api/projects

# Create a task
curl -X POST -H "x-api-key: ak_xxx" \
  -H "Content-Type: application/json" \
  -d '{"project_id": "uuid", "title": "Investigate bug #42"}' \
  https://pdzbejpiilgwgqhmbrso.supabase.co/functions/v1/api/tasks

# Add a note to a task
curl -X POST -H "x-api-key: ak_xxx" \
  -H "Content-Type: application/json" \
  -d '{"task_id": "uuid", "content": "Found the root cause in auth module"}' \
  https://pdzbejpiilgwgqhmbrso.supabase.co/functions/v1/api/notes
```
