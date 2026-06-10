## Goal

In the project task view, let users:
1. **Reorder groups** (e.g., move "June26" above/below other groups) via drag and drop on the group header.
2. **Collapse / expand** each group to hide its task rows, keeping the header (name + task count) visible.

## Scope

Only `src/components/TaskList.tsx` changes. No DB schema changes — `task_groups.position` already exists and `useTaskGroups.reorderGroups` is already wired up.

### 1. Drag-and-drop for groups

- Wrap the list of groups (including "Ungrouped") in a second `SortableContext` using a vertical strategy, alongside the existing per-task sortable contexts.
- Each group becomes a sortable item keyed by container id. The drag handle is a small grip icon on the **group header only** (not the whole card, to avoid conflicting with task drag).
- "Ungrouped" stays pinned at the bottom and is **not draggable**.
- On drag end for a group, compute the new order and call a new prop `onReorderGroups(fromIndex, toIndex)` which `Index.tsx` wires to `useTaskGroups.reorderGroups`.
- Distinguish group vs task drags by id prefix (e.g. `group:<id>` vs the existing task ids) inside the shared `DndContext`, so we don't need a second DndContext.

### 2. Collapse / expand groups

- Add local state `collapsed: Record<ContainerId, boolean>` in `TaskList`.
- Persist per-user, per-project in `localStorage` under a key like `taskgroup-collapsed:<projectId>` so it survives reloads. No backend.
- Header gets a chevron button (right/down) that toggles collapse. Clicking the header text also toggles; the dropdown menu (`…`) and drag handle do not.
- When collapsed: hide the task rows but keep header, task count, and date label visible. Droppable target stays active so a user can drop a task onto a collapsed group (which auto-expands on hover during drag).

## Technical notes

- New prop on `TaskList`: `onReorderGroups: (fromIndex: number, toIndex: number) => Promise<void> | void`.
- Update the caller in `src/pages/Index.tsx` to pass `reorderGroups` from `useTaskGroups`.
- Sortable item ids for groups: prefix `g:` to avoid collisions with task UUIDs. Update `handleDragStart` / `handleDragEnd` / `handleDragOver` to branch on prefix.
- Collapse state shape: `{ [containerId]: true }`. Default = expanded. Ungrouped included.
- Auto-expand on drag-over of a collapsed group: in `handleDragOver`, if the over container is collapsed and a task is being dragged, set it expanded.

## Out of scope

- Reordering across projects.
- Server-side persistence of collapsed state.
- Animations beyond default dnd-kit transitions.
