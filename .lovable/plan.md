
# Chat Notifications

## Overview
Add two layers of notification to keep users aware of new chat messages:

1. **Browser push notifications** -- when a new message arrives in any project and the tab is not focused, show a native browser notification with the sender name and message preview.
2. **Unread badge** -- a red dot on the "Chat" tab button when there are unread messages in the active project's chat (i.e. messages arrived while the user was on the Tasks tab).

Keeping it simple: no notification settings page, no per-project unread counts in the sidebar, no sound -- just the two essentials above.

---

## Implementation

### 1. Browser Notification Permission
- On first load (or first chat view), call `Notification.requestPermission()` to prompt the user.
- Store permission state so we don't re-prompt unnecessarily.
- This will be handled inside the existing `useProjectChat` hook.

### 2. Browser Push Notification on New Message
- In the Realtime `INSERT` handler inside `useProjectChat`, after enriching the message:
  - If `msg.user_id !== currentUser.id` (not your own message) AND `document.hidden === true` (tab not focused):
    - Show a native `new Notification(...)` with the sender's display name and a truncated message preview.
- No service worker or backend push needed -- this uses the simple Notification API which works while the tab is open but not focused.

### 3. Unread Badge on Chat Tab
- Add an `unreadChat` boolean state to `Index.tsx`.
- The `useProjectChat` hook will accept an optional `onNewMessage` callback.
- When a new message arrives from another user, fire the callback.
- In `Index.tsx`, the callback sets `unreadChat = true` -- but only if `activeTab !== 'chat'`.
- When the user switches to the Chat tab, reset `unreadChat = false`.
- Render a small red dot on the Chat tab button when `unreadChat` is true.

---

## Files Changed

| Action | File | What |
|--------|------|------|
| Edit | `src/hooks/useProjectChat.ts` | Add browser notification in realtime handler; add `onNewMessage` callback param |
| Edit | `src/pages/Index.tsx` | Add `unreadChat` state, pass callback to chat hook, render red dot badge |

### Technical Detail

**useProjectChat.ts changes:**
- Add optional `onNewMessage?: (msg: ChatMessage) => void` parameter
- In the realtime INSERT handler, after enriching the message, if `msg.user_id !== user.id`:
  - Call `onNewMessage?.(enriched)`
  - If `document.hidden` and `Notification.permission === 'granted'`, show a browser notification

**Index.tsx changes:**
- Add `const [unreadChat, setUnreadChat] = useState(false)`
- Request notification permission on mount with `useEffect`
- Pass `onNewMessage` callback to `useProjectChat` that sets `unreadChat(true)` when `activeTab !== 'chat'`
- Reset `unreadChat(false)` when switching to chat tab
- Add a red dot (`<span className="h-2 w-2 rounded-full bg-destructive" />`) next to the Chat label when `unreadChat` is true
