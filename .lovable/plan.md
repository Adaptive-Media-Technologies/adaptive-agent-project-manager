

# Dark Mode UI/UX Overhaul

## Problem
The dark mode is broken because the `.dark` CSS block in `src/index.css` is missing overrides for many custom tokens -- sidebar panel, chat bubbles, notes, and marketing colors all fall back to their light-mode values, causing white-on-black, black-on-black, and washed-out elements.

## What Changes

### 1. Complete Dark Mode Token Coverage (src/index.css)
Add missing dark-mode overrides inside the `.dark` block for every custom token:

**Sidebar Panel** -- currently defaults to white backgrounds in dark mode:
- `--sidebar-panel-background` -> deep navy (e.g. `222 30% 11%`)
- `--sidebar-panel-foreground` -> light text (`210 40% 90%`)
- `--sidebar-panel-border` -> subtle dark border (`222 20% 18%`)
- `--sidebar-panel-muted` -> slightly lighter surface (`222 25% 15%`)
- `--sidebar-panel-active` -> keep purple (`270 60% 65%`) but brighten for contrast
- `--sidebar-panel-active-bg` -> dark tinted purple (`270 40% 18%`)

**Chat Bubbles** -- currently light pastel purple/blue, unreadable on dark backgrounds:
- `--chat-own-bg` -> muted purple (`270 30% 18%`)
- `--chat-own-border` -> `270 25% 28%`
- `--chat-other-bg` -> muted blue (`210 30% 16%`)
- `--chat-other-border` -> `210 25% 26%`
- `--chat-mention-bg` -> `270 40% 22%`
- `--chat-mention-text` -> `270 60% 75%`

**Marketing / Landing page** -- currently white surfaces with dark text:
- `--marketing-surface` -> dark bg
- `--marketing-surface-alt` -> slightly lighter
- `--marketing-text` -> light text
- `--marketing-text-muted` -> dimmed light text

### 2. Fix Note Colors for Dark Mode (src/hooks/useProjectNotes.ts)
All colored notes hardcode `text-black` which is invisible on dark backgrounds. Change to `text-foreground` so the text adapts automatically. The gradient overlays already use low opacity so they will look fine on dark surfaces.

### 3. Minor Component Fixes
- **Task input bar** and **chat input box**: The `bg-card` / `bg-background` usage should work with proper tokens but verify the contentEditable placeholder text and borders are visible.

## Technical Details

### File: src/index.css
Inside the existing `.dark { ... }` block (lines 84-127), add all missing custom property overrides after the existing sidebar variables.

### File: src/hooks/useProjectNotes.ts
Change `text: 'text-black'` and `placeholder: 'placeholder:text-black/50'` to `text: 'text-foreground'` and `placeholder: 'placeholder:text-muted-foreground'` for all colored note variants (Sunset, Ocean, Forest, Aurora, Ember, Gold, Storm).

### Files to Modify

| File | Change |
|------|--------|
| `src/index.css` | Add ~20 dark-mode CSS custom properties for sidebar-panel, chat, and marketing tokens |
| `src/hooks/useProjectNotes.ts` | Replace hardcoded `text-black` with `text-foreground` in all colored note configs |

