

## Plan: Complete Task Management Features

The current app has basic auth, projects, and tasks working. Here's what needs to be added/improved to match all 6 requirements:

### What's Already Working
- Authentication (sign up / sign in / sign out)
- Projects sidebar with create
- Tasks with status cycling (open -> in_progress -> complete)
- Task delete

### What's Missing

#### 1. Visible Status Labels on Tasks
Currently the task item only shows an icon for status. Add a small text label ("Open", "Doing", "Done") next to the icon so the current status is always clear at a glance.

**File:** `src/components/TaskItem.tsx`
- Update `statusConfig` labels to "Open", "Doing", "Done"
- Show the label text next to the icon

#### 2. Project "More" Details Drawer
Projects need tap-to-see-more for dates and task counts. Add a small info button in the project header that opens a drawer/sheet showing:
- Created date
- Last updated date
- Task count summary (open/doing/done)

**Files:**
- `src/pages/Index.tsx` - Add info button in project header that opens a sheet
- Use existing `Sheet` component for the details panel

#### 3. Drag-and-Drop Reordering
Tasks need to be draggable to reorder by priority (most important at top). The `reorder` function already exists in `useTasks.ts`.

**Changes:**
- Install `@dnd-kit/core` and `@dnd-kit/sortable`
- Create `src/components/TaskList.tsx` - wrapper with DndContext and SortableContext
- Update `TaskItem.tsx` - add drag handle using `useSortable`
- Wire up `reorder` from `useTasks` on drag end

#### 4. Time Tracking UI
Each task needs a simple way to log time. Add a small clock icon on each task that expands an inline input for logging minutes.

**Files:**
- Create `src/hooks/useTimeEntries.ts` - fetch/add time entries for a task from `time_entries` table
- Update `TaskItem.tsx` - add clock icon toggle that shows a quick minute-entry input
- Keep it minimal: tap clock, type minutes, press enter

#### 5. API for AI Agents (Supabase Edge Function)
Create a clean REST API edge function for OpenClaw agents to CRUD projects and tasks.

**File:** `supabase/functions/api/index.ts`
- Single edge function handling routes: `GET/POST /projects`, `GET/POST/PATCH/DELETE /tasks`, `POST /tasks/reorder`
- Auth via API key (checked against `api_keys` table) or JWT
- Clean JSON responses

#### 6. Minor Fixes
- Fix the `AuthProvider` wrapping order in `App.tsx` (AuthProvider needs to be inside BrowserRouter if using navigation, but current setup works since Auth page handles redirect)
- No other structural changes needed

### Implementation Order
1. Update TaskItem with visible status labels
2. Add drag-and-drop (install @dnd-kit, create TaskList, update TaskItem)
3. Add time tracking hook and UI
4. Add project details drawer
5. Create API edge function

### Technical Notes
- All UI stays lightweight - no heavy components, just small additions to existing ones
- @dnd-kit is ~8KB gzipped, the lightest DnD library for React
- Time tracking UI is just an inline input toggle, not a modal or separate page
- Edge function uses Deno and the existing Supabase client pattern
