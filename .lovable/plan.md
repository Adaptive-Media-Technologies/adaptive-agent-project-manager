
# Chat UI/UX Overhaul — Slack-Style Navigation

## Current Problem

Chat is deeply hidden: users must first pick a project in the sidebar, then switch to the "Chat" tab in the top header. There's no way to see chat activity across projects at a glance, and no unread indicators visible until you're already inside a project.

## Proposed Solution

Bring **Chat** up as a first-class icon in the icon rail (Level 1 sidebar), then use the Level 2 content panel to list all projects that have chats — similar to Slack's channel list. Clicking a project in the chat panel opens the full-screen chat in the main area.

---

## New Navigation Structure

```text
Icon Rail (Level 1)      Content Panel (Level 2)        Main Area
┌──────────────┐         ┌────────────────────────┐     ┌──────────────────────────┐
│  🏠 Home     │         │ DIRECT MESSAGES        │     │                          │
│  💬 Chat  ←  │ active  │  • My Projects         │     │  [Project Name] Chat     │
│  📅 Calendar │         │    ○ Project Alpha  🔴2 │────▶│  ┌──────────────────┐   │
│  👥 Teams    │         │    ○ Project Beta       │     │  │ message bubbles  │   │
│  🤖 Agents   │         │ TEAM CHANNELS          │     │  │ ...              │   │
│              │         │  ▸ Team Orion           │     │  └──────────────────┘   │
│  ⚙ Settings  │         │    ○ #dev-ops      🔴1 │     │  [input bar]             │
│  👤 Avatar   │         │    ○ #marketing         │     │                          │
└──────────────┘         └────────────────────────┘     └──────────────────────────┘
```

---

## Detailed Changes

### 1. Add "Chat" to the Icon Rail
- Insert a `MessageSquare` icon between Home and Calendar in `railItems`
- Show a red badge on the rail icon with the **total unread count** across all projects
- Rail key: `'chat'`

### 2. Chat Content Panel (Level 2 when `activeRailTab === 'chat'`)
Replace the blank panel with a Slack-style channel/project list:

**Section: My Projects**
- List all private projects
- Show an unread dot/badge next to any with new messages
- Clicking a project sets `activeChatProjectId` and opens full chat in main

**Section: Team Channels** (grouped by team, collapsible like current sidebar)
- List each team's projects as "channels"
- Show team name as a group header
- Unread badges per project

**Visual style:** mirrors the existing sidebar panel — same font sizes, hover states, active highlight, and collapsible team groups.

### 3. New `activeChatProjectId` State
- A new `useState<string | null>('activeChatProjectId')` tracks which project's chat is open when `activeRailTab === 'chat'`
- Separate from `activeProjectId` (the tasks view) so switching to chat doesn't disrupt your tasks context
- On first entering Chat rail, auto-select the most recently active project

### 4. Main Area — Full-Screen Chat View
When `activeRailTab === 'chat'`:
- Show a full-height chat panel with a proper header showing the project name and type badge
- Remove the tab switcher (Tasks / Chat) — it's now only in the Tasks context
- The existing `<ProjectChat>` component renders here unchanged
- Show an empty state if no `activeChatProjectId` is selected ("Select a project to start chatting")

### 5. Unread Tracking Improvements
- Extend the existing `unreadChat` boolean into a `Map<string, number>` — `unreadCounts: Map<string, number>`
- Increment count when a new message arrives for a project that isn't currently open in chat view
- Clear count when a project is selected in the chat panel
- The rail icon badge shows `Object.values(unreadCounts).reduce((a,b) => a+b, 0)`
- Small red dot/number badge appears next to each project name in the content panel

### 6. Remove the In-Project Tab Switcher (simplification)
- The current Tasks/Chat tab switcher in the project header becomes **Tasks only**
- Chat is accessed exclusively via the Chat rail icon
- This declutters the project header and makes Chat feel like its own first-class space

---

## Technical Implementation

### Files to modify:

**`src/pages/Index.tsx`** — main changes:
1. Add `'chat'` to `railItems` array with `MessageSquare` icon
2. Add `activeChatProjectId` state (`useState<string | null>(null)`)
3. Add `unreadCounts` state (`useState<Record<string, number>>({})`)
4. Update `handleChatNewMessage` to accept a `projectId` param and increment the correct counter
5. Add the chat content panel section (`activeRailTab === 'chat'`) to Level 2 sidebar — project list with unread badges
6. Add the full-screen chat main area when `activeRailTab === 'chat'`
7. Remove the Tasks/Chat tab switcher from the project header (keep only Tasks view)
8. Remove the `activeTab` and `unreadChat` state (replaced by new system)
9. Add the total unread badge on the Chat rail icon

**No new files, no new dependencies** — the existing `<ProjectChat>` component is reused as-is.

---

## Visual Design Details

- **Unread badge on rail icon**: small red circle with number (or just a dot if ≤ 0), positioned top-right of the `MessageSquare` icon, using `absolute` positioning within a `relative` wrapper
- **Project rows in chat panel**: same 13px text, `FolderOpen` icon, active highlight with the purple `--sidebar-panel-active` variable; unread counts shown as a small `bg-destructive text-white rounded-full px-1.5 text-[10px]` chip on the right
- **Chat main area header**: mirrors the existing project header style with the project name, type badge, and a "Members" count — but no tab switcher
- **Empty state**: centered illustration with `MessageSquare` icon and "Select a project to chat" prompt

---

## Before vs After

| Aspect | Before | After |
|---|---|---|
| Accessing chat | Project → Tab switch | Chat icon in rail |
| Seeing all project chats | Not possible | Channel list in panel |
| Unread visibility | Only when inside a project | Badge on rail icon + per-project |
| Navigation depth | 3 clicks minimum | 2 clicks maximum |
| Full-screen chat | No (split with tasks header) | Yes, dedicated full-height view |
