

# Rich Text Input for Chat and Task Input

## Summary
Upgrade both the **project chat input** and the **task input bar** from single-line `<input>` elements to multi-line `<textarea>` elements (minimum 4 lines), and add a formatting toolbar with bold, italic, strikethrough, and other options -- similar to the Slack-style toolbar in your screenshot.

---

## What Changes

### 1. Chat Input (ProjectChat.tsx)
- Replace the single-line `<input>` with a `<textarea>` (min 4 rows, auto-grows)
- Add a formatting toolbar row above the textarea with buttons for:
  - **Bold** (wraps selection in `**text**`)
  - *Italic* (`*text*`)
  - ~~Strikethrough~~ (`~~text~~`)
  - Bulleted list
  - Code inline (`` `code` ``)
- Keep existing emoji picker, file attach, and @mention functionality
- Send with button click; Shift+Enter for newlines, Enter alone still sends
- Render markdown formatting in message bubbles (parse `**bold**`, `*italic*`, etc.)

### 2. Task Input (Index.tsx -- floating task bar)
- Replace the single-line `<Input>` with a `<textarea>` (min 4 rows, auto-grows)
- Add a smaller formatting toolbar: Bold, Italic, Bulleted list
- Submit with button or Ctrl/Cmd+Enter

### 3. Message Rendering (ProjectChat.tsx -- renderMessageContent)
- Update to parse and render basic markdown: bold, italic, strikethrough, inline code, and bullet lists
- Keep the existing @mention highlighting

---

## Technical Details

### Formatting Toolbar Component
Create a new reusable component `src/components/FormattingToolbar.tsx`:
- Accepts a ref to the textarea
- Buttons for Bold, Italic, Strikethrough, Bulleted List, Inline Code
- Each button wraps the current selection in the textarea with the appropriate markdown syntax (e.g., `**` for bold)
- Uses lucide icons: `Bold`, `Italic`, `Strikethrough`, `List`, `Code`

### Chat Input Changes (`src/components/ProjectChat.tsx`)
- Replace `<input ref={inputRef}>` with `<textarea ref={inputRef}>` (min-height ~4 lines, max-height capped so it doesn't grow forever)
- Update `inputRef` type from `HTMLInputElement` to `HTMLTextAreaElement`
- Update `handleTextChange` and `handleKeyDown` for textarea behavior
- Add `<FormattingToolbar>` row between the toolbar icons (emoji, attach) and the textarea
- Adjust the input bar layout from a single horizontal row to a vertical stack: toolbar on top, textarea below, action buttons alongside

### Task Input Changes (`src/pages/Index.tsx`)
- Replace `<Input>` with `<textarea>` in the floating task form
- Add `<FormattingToolbar>` above or inline
- Adjust form submission: Enter with no shift adds task, Shift+Enter for newline

### Message Rendering (`src/components/ProjectChat.tsx`)
- Update `renderMessageContent()` to parse markdown patterns:
  - `**text**` renders as `<strong>`
  - `*text*` renders as `<em>`
  - `` ~~text~~ `` renders as `<s>`
  - `` `code` `` renders as `<code>` with a subtle background
  - Lines starting with `- ` or `* ` render as list items

### Files to modify

| File | Change |
|---|---|
| `src/components/FormattingToolbar.tsx` | New reusable toolbar component |
| `src/components/ProjectChat.tsx` | Swap input to textarea, add toolbar, update renderer |
| `src/pages/Index.tsx` | Swap task input to textarea, add toolbar |

