
# AI Agent API Integration Plan

## Overview

Local AI agents connect to the product via the REST API edge function (`/api/*`), authenticating with API keys. Agents sign up as normal users, get invited to teams, and receive API keys.

## Base URL

```
https://pdzbejpiilgwgqhmbrso.supabase.co/functions/v1/api
```

## Authentication

All requests require one of:
- `x-api-key: ak_xxx` header (recommended for agents)
- `Authorization: Bearer <jwt>` header

## API Reference

### Keys (Phase 1 ✅)

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/keys` | — | List your API keys (hash hidden) |
| POST | `/keys` | `{ label? }` | Generate new key. Returns raw key **once**. |
| DELETE | `/keys/:id` | — | Revoke an API key |

### Teams (Phase 2 ✅)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/teams` | List teams you belong to |

### Projects (Phase 2 ✅ — team-scoped)

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/projects` | — | List owned + team projects |
| POST | `/projects` | `{ name, team_id? }` | Create project |

### Tasks (Phase 2 ✅ — access-checked)

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/tasks?project_id=xxx` | — | List tasks |
| POST | `/tasks` | `{ project_id, title }` | Create task |
| PATCH | `/tasks/:id` | `{ title?, status? }` | Update task (status: open/in_progress/complete) |
| DELETE | `/tasks/:id` | — | Delete task |
| POST | `/tasks/reorder` | `{ project_id, task_ids[] }` | Reorder tasks |

### Task Notes

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/notes?task_id=xxx` | — | List notes on a task |
| POST | `/notes` | `{ task_id, content }` | Add a note |
| DELETE | `/notes/:id` | — | Delete a note |

### Project Notes (Phase 3 ✅)

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/project-notes?project_id=x` | — | Get project note |
| PUT | `/project-notes` | `{ project_id, content, color? }` | Upsert project note |

### Time

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/time` | `{ task_id, minutes }` | Log time entry |

## Agent Setup Flow

```
1. Sign up at the web app (email/password)
2. Team admin invites agent by email → auto-joins
3. Generate API key:  POST /api/keys { "label": "my-agent" }
4. Save the returned `key` — it's shown only once
5. Use x-api-key header for all subsequent calls
```

## Examples

```bash
# Generate an API key (using JWT from initial login)
curl -X POST -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"label": "coding-agent"}' \
  $BASE_URL/keys

# List your teams
curl -H "x-api-key: ak_xxx" $BASE_URL/teams

# List projects (includes team projects)
curl -H "x-api-key: ak_xxx" $BASE_URL/projects

# Create a task
curl -X POST -H "x-api-key: ak_xxx" \
  -H "Content-Type: application/json" \
  -d '{"project_id": "uuid", "title": "Fix auth bug"}' \
  $BASE_URL/tasks

# Update task status
curl -X PATCH -H "x-api-key: ak_xxx" \
  -H "Content-Type: application/json" \
  -d '{"status": "complete"}' \
  $BASE_URL/tasks/<task-id>

# Add a note to a task
curl -X POST -H "x-api-key: ak_xxx" \
  -H "Content-Type: application/json" \
  -d '{"task_id": "uuid", "content": "Root cause found in auth module"}' \
  $BASE_URL/notes

# Get/set project notes
curl -H "x-api-key: ak_xxx" "$BASE_URL/project-notes?project_id=uuid"
curl -X PUT -H "x-api-key: ak_xxx" \
  -H "Content-Type: application/json" \
  -d '{"project_id": "uuid", "content": "Sprint goals: ..."}' \
  $BASE_URL/project-notes
```

## Database Prerequisite

The `api_keys` table needs `label` and `key_prefix` columns if not already present:

```sql
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS label text DEFAULT 'default';
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS key_prefix text;
```

## Future Work

- [ ] Rate limiting
- [ ] Agent SDK (Python / TypeScript)
- [ ] Webhook notifications for task changes
- [ ] File attachment support
