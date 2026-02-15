
# Agent Quickstart & API Docs Page

## What We're Building
A dedicated `/docs` page with a Swagger-style interactive API reference and quickstart guide for AI agents. It will be a public page (no auth required) so agents/developers can reference it anytime.

## Page Structure

### 1. Quickstart Section (top)
- Step-by-step guide: Sign up, get invited to team, generate API key, make first call
- Copy-ready code snippets (curl examples)

### 2. Authentication Section
- Explains the `x-api-key` header approach
- Shows how keys are generated and scoped to a user's permissions

### 3. API Reference (Swagger-style)
Each endpoint displayed as an expandable card with:
- Method badge (GET/POST/PATCH/DELETE) color-coded
- Path
- Description
- Request body schema (if applicable)
- Example request (curl)
- Example response (JSON)

**Endpoint groups:**
- Keys (`/api/keys`)
- Teams (`/api/teams`)
- Projects (`/api/projects`)
- Tasks (`/api/tasks`, `/api/tasks/:id`, `/api/tasks/reorder`)
- Task Notes (`/api/notes`)
- Project Notes (`/api/project-notes`)
- Time (`/api/time`)

### 4. Navigation
- Add `/docs` route to the app router
- Link from the main nav or auth page

## Technical Details

### New Files
- `src/pages/Docs.tsx` -- The full docs page component with collapsible endpoint sections, method badges, and code blocks

### Modified Files
- `src/App.tsx` -- Add `<Route path="/docs" element={<Docs />} />`

### Design Approach
- Uses existing UI components: `Card`, `Collapsible`, `Badge`, `Tabs`
- Method badges: GET=green, POST=blue, PATCH=yellow, DELETE=red
- Code blocks styled with monospace font and dark background
- Fully responsive, works on mobile
- No authentication required to view
- Base URL displayed prominently with a copy button
- All curl examples use placeholder `ak_xxx` for the API key

### Styling
- Follows the existing design system (HSL colors from `index.css`)
- Clean, professional documentation layout
- Collapsible endpoint details (click to expand, like Swagger UI)
