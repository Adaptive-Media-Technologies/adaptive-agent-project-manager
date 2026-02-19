

# UI/UX Polish: From Prototype to Production

## Overview
Refine the visual design across the entire application to match the quality level shown in the reference designs (ChronoTask and Black Wallet). The focus is on spacing, typography hierarchy, visual depth, component polish, and micro-interactions -- not new features.

---

## 1. Sidebar Refinement

**Current issues**: Flat appearance, cramped spacing, no branding, basic project buttons.

**Changes to `src/pages/Index.tsx` (sidebar section)**:
- Add the AgntFind logo and brand name at the top of the sidebar (import the existing `agntfind-logo.png` asset)
- Increase vertical padding between sections (from `space-y-4` to `space-y-6`)
- Add a subtle left border accent (3px) on the active project button instead of just a background change
- Use slightly larger text (text-[13px]) for project names with better truncation
- Add a task count badge (small pill) next to each project name showing open task count
- Style section headers ("My Projects", team names) with slightly more spacing above them
- Add a "Create" button at the top of the sidebar (similar to ChronoTask's prominent Create button) as a styled outlined button, replacing the bottom "New Project" ghost button
- Move "Manage Teams" into a small icon-only button in the sidebar footer alongside the profile avatar
- Add a subtle gradient or slightly different shade at the sidebar top for visual separation

## 2. Main Header / Project Header

**Current issues**: Tab toggle and project name look basic. Info button floats awkwardly.

**Changes to `src/pages/Index.tsx` (header section)**:
- Make the project name larger and bolder (`text-xl font-bold`)
- Add breadcrumb-style context below the project name: project type badge (Private/Team) as a small styled chip
- Restyle the Tasks/Chat tab toggle as a proper segmented control with a sliding background indicator (using a `div` with rounded-lg background that moves), giving it a more polished feel
- Move the Info button into the project name row as a subtle icon, not a separate floating button
- Add a subtle bottom shadow on the header instead of just a border (`shadow-sm`)

## 3. Task Items

**Current issues**: Tasks look like basic list rows. Status labels are tiny. No visual richness.

**Changes to `src/components/TaskItem.tsx`**:
- Increase vertical padding from `py-2` to `py-3`
- Make the status indicator a colored dot/pill badge instead of icon + text (similar to the reference's colored tags)
- Add a subtle left border color based on status: muted for open, blue for in-progress, green for complete
- Show the task time as a styled badge/chip rather than plain text
- Add a hover shadow effect (`hover:shadow-sm`) for depth
- Make the drag handle always slightly visible (opacity-30 instead of opacity-0) for discoverability
- Use `rounded-xl` instead of `rounded-lg` for softer card feel

## 4. Task Input Bar

**Current issues**: Bottom input bar is flat and basic.

**Changes to `src/pages/Index.tsx` (task form)**:
- Restyle as a floating input bar with shadow and rounded corners, inset from edges
- Add a subtle icon (Plus in a circle) inside the input as a prefix
- Make the submit button a proper styled button with icon, not just a ghost icon button
- Add `shadow-sm` and `rounded-xl` to the container

## 5. Project Notes

**Current issues**: Note area is functional but looks like a raw textarea.

**Changes to `src/pages/Index.tsx` (note section)**:
- Add a small label above ("Notes") with a notepad icon
- Add `rounded-xl` and subtle `shadow-sm` for card-like appearance
- Slightly increase padding inside the note area

## 6. Empty States

**Current issues**: Empty state (no tasks, no project selected) looks bare.

**Changes to `src/pages/Index.tsx`**:
- For the "no project selected" state: increase logo size, add a subtle tagline, style the text with better hierarchy
- For "no tasks" empty state: use a more visually appealing illustration-style icon, improve copy styling

## 7. Chat Interface Polish

**Changes to `src/components/ProjectChat.tsx`**:
- Add `rounded-xl` to message bubbles with a very subtle background tint for own messages vs others
- Improve attachment chips with better padding and rounded corners
- Add smooth entry animation for new messages (CSS `animate-in fade-in slide-in-from-bottom-2`)
- Style the input bar to match the task input bar improvements (floating, shadow, rounded)

## 8. Stopwatch Widget

**Changes to `src/components/Stopwatch.tsx`**:
- Add a colored header bar (using timer-active color) similar to the ChronoTask time tracker card
- Increase overall size slightly for better readability
- Use `shadow-xl` for more prominent floating feel
- Add a pulsing dot indicator when timer is running

## 9. Task Detail Sheet

**Changes to `src/components/TaskDetailDialog.tsx`**:
- Add section dividers (horizontal rules) between Status, Time Log, Notes, and Attachments
- Style section headers consistently with icon + label
- Improve note cards with better avatar sizing and spacing
- Add subtle background tint to attachment rows on hover

## 10. Global CSS Refinements

**Changes to `src/index.css`**:
- Add a custom scrollbar style (thin, subtle) for webkit browsers
- Add subtle transition utility class for card hover effects
- Ensure consistent focus ring styling across all interactive elements

---

## Files Changed

| Action | File | Summary |
|--------|------|---------|
| Edit | `src/pages/Index.tsx` | Sidebar branding, header polish, tab segmented control, input bar, empty states, note styling |
| Edit | `src/components/TaskItem.tsx` | Card padding, status badges, left border accent, hover shadow, rounded corners |
| Edit | `src/components/ProjectChat.tsx` | Message bubble styling, input bar, entry animations |
| Edit | `src/components/Stopwatch.tsx` | Colored header, shadow, running indicator |
| Edit | `src/components/TaskDetailDialog.tsx` | Section dividers, consistent headers, spacing |
| Edit | `src/index.css` | Custom scrollbars, transition utilities |

---

## Technical Notes

- No new dependencies needed -- all changes use existing Tailwind classes and shadcn components
- No database or API changes
- All changes are purely visual/CSS -- no logic changes
- The existing component structure is preserved; only className props and minor JSX restructuring
- The AgntFind logo asset already exists at `src/assets/agntfind-logo.png`

