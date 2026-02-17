
# Edit Time Logged in Task Detail Panel

## Problem
If you forget to turn off the stopwatch timer, there's no way to correct the logged time. Currently, time entries are insert-only with no update or delete capability.

## Proposed Solution
Add a **time log section** to the Task Detail sheet (the panel that opens when you click the "..." icon on a task). This section will:

1. **Show a list of all individual time entries** for that task, each displaying:
   - Duration (e.g. "15m" or "1h 30m")
   - Who logged it
   - When it was logged
2. **Allow editing** any entry's duration inline (click the time to edit)
3. **Allow deleting** an entry (trash icon, same pattern as notes)
4. **Allow manually adding** a new time entry (input field + button, similar to how notes work)

## Database Changes Required
- Add **UPDATE** and **DELETE** RLS policies to the `time_entries` table so users can modify their own entries
- Policies will be scoped to `user_id = auth.uid()` for safety

## Code Changes

### 1. Migration: Add UPDATE/DELETE policies to `time_entries`
- `UPDATE` policy: users can update their own entries (`user_id = auth.uid()`)
- `DELETE` policy: users can delete their own entries (`user_id = auth.uid()`)

### 2. Update `useTimeEntries.ts`
- Add `updateEntry(id, minutes)` function
- Add `deleteEntry(id)` function
- Fetch entries with timestamps for display

### 3. Update `TaskDetailDialog.tsx`
- Add a "Time Log" section between Status/Time and Notes
- List each time entry with editable duration, author avatar, and timestamp
- Add inline edit (click duration to change it) and delete button
- Add a manual "Log time" input (minutes field + Add button)

### 4. Wire up from `TaskList.tsx`
- Pass `onLogTime`, time entry functions, and entries data through to the detail dialog

## Visual Layout in Task Detail
```text
+----------------------------------+
| Task Title                 [edit]|
|----------------------------------|
| Status: In Progress  Time: 1h 5m|
| Created: Feb 17, 2026           |
|----------------------------------|
| TIME LOG                         |
| [  15  ] min  + Add              |
|                                  |
|  (AV) You - 45m     Feb 17  [x] |
|  (AV) You - 20m     Feb 16  [x] |
|----------------------------------|
| NOTES                            |
| ...                              |
|----------------------------------|
| ATTACHMENTS                      |
| ...                              |
+----------------------------------+
```

Each time entry row will have an editable minutes value and a delete button on hover, following the same interaction pattern as notes.
