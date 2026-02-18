

# Slack-Style Project Chat with Attachments

## Overview
Add a real-time chat channel to each project with support for text messages, emoji, GIF search, and **file attachments** (images, PDFs, documents). This builds on the existing task-attachments pattern already in the codebase.

---

## Database Changes

### 1. New table: `project_messages`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | default gen_random_uuid() |
| project_id | uuid (FK -> projects.id ON DELETE CASCADE) | not null |
| user_id | uuid | not null, message author |
| content | text | not null, default '' (can be empty if only attachment/GIF) |
| gif_url | text | nullable, attached GIF URL |
| created_at | timestamptz | default now() |

### 2. New table: `message_attachments`
Follows the same pattern as `task_attachments`:

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | default gen_random_uuid() |
| message_id | uuid (FK -> project_messages.id ON DELETE CASCADE) | not null |
| file_name | text | not null |
| file_path | text | not null (path in storage bucket) |
| file_size | integer | nullable |
| content_type | text | nullable |
| uploaded_by | uuid | not null |
| created_at | timestamptz | default now() |

### 3. New storage bucket: `chat-attachments`
- Public bucket (same pattern as `task-attachments`)
- RLS policies on storage.objects for upload/read/delete scoped to authenticated users who are project members

### 4. RLS Policies

**project_messages:**
- SELECT: user is project member (via `is_project_member`)
- INSERT: user is project member AND `user_id = auth.uid()`
- DELETE: `user_id = auth.uid()` (own messages only)

**message_attachments:**
- SELECT: user can view the parent message's project
- INSERT: `uploaded_by = auth.uid()` AND user is project member
- DELETE: `uploaded_by = auth.uid()`

### 5. Realtime
- Enable Supabase Realtime on `project_messages` for instant delivery

---

## Frontend Changes

### New hook: `src/hooks/useProjectChat.ts`
- Fetch messages for a project (ordered by `created_at ASC`) with author profiles joined
- Subscribe to Supabase Realtime for new `INSERT` events
- `sendMessage(content, gifUrl?, files?)` -- uploads files to `chat-attachments` bucket, inserts message + attachment records
- `deleteMessage(id)` -- deletes message and its attachments (cascade handles DB rows, storage files cleaned up explicitly)
- Auto-scroll on new messages

### New component: `src/components/ProjectChat.tsx`
The main chat view with:
- **Message list** (ScrollArea): Each message shows avatar, display name, timestamp, text content, inline image previews for image attachments, download links for non-image files, and embedded GIFs
- **Input bar** (pinned to bottom):
  - Text input
  - Emoji picker button (popover)
  - GIF search button (popover)
  - **Attachment button** (paperclip icon) -- opens file picker, supports multiple files
  - Send button
  - **Attachment preview strip** -- shows selected files before sending with remove buttons

### New component: `src/components/EmojiPicker.tsx`
- Popover grid of ~100 curated Unicode emojis by category
- Click to insert at cursor position
- No external dependency

### New component: `src/components/GifPicker.tsx`
- Popover with search input querying GIPHY public API
- Grid of GIF thumbnails, click to attach
- GIF stored as URL only

### Update: `src/pages/Index.tsx`
- Add **Tasks | Chat** tab toggle in the project content area
- Chat tab renders `ProjectChat` component

---

## Message Rendering

Each chat message bubble will display:

```text
[Avatar] Display Name              2:30 PM
  Message text here...
  [image-thumb.png]  [document.pdf - 2.4MB - Download]
  [embedded GIF if present]
                                    [Delete] (own messages, on hover)
```

- Image attachments render as inline thumbnails (clickable to open full size)
- Non-image files show as a styled chip with filename, size, and download link
- GIFs render inline as animated images

---

## File Summary

| Action | File |
|--------|------|
| Migration | `supabase/migrations/..._create_project_chat.sql` |
| Create | `src/hooks/useProjectChat.ts` |
| Create | `src/components/ProjectChat.tsx` |
| Create | `src/components/EmojiPicker.tsx` |
| Create | `src/components/GifPicker.tsx` |
| Edit | `src/pages/Index.tsx` (add tab toggle) |

