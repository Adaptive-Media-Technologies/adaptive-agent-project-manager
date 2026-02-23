
# Dashboard for Home Screen

Replace the current empty state (logo + "Select or create a project") with a rich, data-driven dashboard that appears when no project is selected on the Home tab.

## Layout

The dashboard uses a scrollable grid layout with these sections:

### 1. Welcome Header
- Greeting with user's display name and current date
- Quick action buttons: "New Project", "New Task" (opens first project)

### 2. Stats Cards Row (4 cards in a row)
- **Open Tasks** - count across all projects, amber accent
- **In Progress** - count across all projects, blue accent  
- **Completed** - count across all projects, green accent
- **Projects** - total project count, purple accent

Each card shows a large number with an icon and label.

### 3. Two-Column Layout Below Stats

**Left Column (wider ~60%):**

#### Task Distribution Chart
- Donut/pie chart using Recharts showing Open vs In Progress vs Complete across all projects
- Uses the existing `ChartContainer` component and status colors from the design system

#### Tasks by Project (Horizontal Bar Chart)
- Bar chart showing task counts per project (top 8 projects)
- Stacked bars: open, in progress, complete

**Right Column (~40%):**

#### AI Agents Summary Card
- Count of agents, list of agent names with bot icon
- For each agent: number of assigned tasks by status (open/in progress/done)
- Compact card rows

#### Team Members Card  
- Avatars + display names + usernames of all team members across all teams
- Deduplicated by user_id
- Shows avatar, name, @username in compact rows

#### Recent Activity / Quick Links Card
- Link to Chat (with unread count badge)
- Link to Calendar
- Link to Archive
- Link to API Docs

## Technical Details

### New Component: `src/components/DashboardHome.tsx`
- Receives props: projects, teams, agents, profile, unread counts
- Fetches **all tasks across all projects** with a single Supabase query (no project_id filter, just user's accessible tasks via RLS)
- Fetches all team members across all teams for the members card
- Uses `recharts` (already installed) with `ChartContainer` from `src/components/ui/chart.tsx`

### New Hook: `src/hooks/useDashboardStats.ts`
- Fetches all non-archived tasks: `supabase.from('tasks').select('id, status, project_id, assigned_to, assigned_type').neq('status', 'archived')`
- Fetches all team members with profiles: reuses the join pattern from `useTeamMembers`
- Returns: `{ allTasks, teamMembers, loading }`

### Changes to `src/pages/Index.tsx`
- Import `DashboardHome`
- Replace the empty state block (lines 1138-1149) with `<DashboardHome />` when `activeRailTab === 'home' && !activeProjectId`
- Pass existing data: projects, agents, profile, totalUnread, teams

### Styling
- Cards use `rounded-xl border border-border bg-card` (matching existing aesthetic)
- Status colors from CSS variables: `--status-open`, `--status-progress`, `--status-done`
- Chart colors match status colors
- Responsive: 1 column on mobile, 2 columns on desktop
- Smooth fade-in animations on cards
