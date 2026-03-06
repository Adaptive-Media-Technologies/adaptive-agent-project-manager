# Agntive.ai — Adaptive Agent Project Manager

Agntive is a **task-driven workspace for teams and AI agents**. It unifies messaging, task tracking, project context, and autonomous AI automation into a single smart workspace — so small teams stop juggling Slack, Notion, and generic bots.

## What’s in this repo

- **Projects & task boards**: drag-and-drop workflows, due dates, progress tracking
- **Team collaboration**: project chat, notes, file attachments
- **Time tracking**: stopwatch + reporting
- **AI agent workflows**: assign tasks to agents, track activity and costs (where enabled)
- **Supabase backend**: migrations and edge functions for app APIs

## Tech stack

- Vite + React + TypeScript
- shadcn/ui + Tailwind CSS
- Supabase (Auth + DB + Edge Functions)

## Quickstart (local development)

### Prerequisites

- Node.js **18+** (20+ recommended)
- npm (or your preferred Node package manager)

### Setup

```sh
# Install dependencies
npm i

# Create local env file
cp .env.example .env
```

Update `.env` with your Supabase project values.

### Run

```sh
npm run dev
```

By default, Vite runs on `http://localhost:8080` (see `vite.config.ts`).

## Environment variables

This project uses Vite-style environment variables (prefixed with `VITE_`).

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (Supabase anon/public key)
- `VITE_SUPABASE_PROJECT_ID`

Notes:

- **Do not commit `.env`**. It is ignored by `.gitignore`.
- Prefer using `.env.example` for sharing required variable names.

## Supabase

Supabase resources live under `supabase/`:

- `supabase/migrations/`: database migrations
- `supabase/functions/`: edge functions (API handlers and utilities)
- `supabase/config.toml`: local/dev configuration

If you use the Supabase CLI locally, you can run standard workflows like `supabase start` and `supabase db reset` (exact commands depend on your local Supabase setup).

## Scripts

```sh
npm run dev        # start dev server
npm run build      # production build
npm run preview    # preview production build
npm run lint       # eslint
npm test           # vitest (CI style)
npm run test:watch # vitest watch
```

## Security

Please report vulnerabilities privately. See [`SECURITY.md`](SECURITY.md).

## License

MIT — see [`LICENSE`](LICENSE).
