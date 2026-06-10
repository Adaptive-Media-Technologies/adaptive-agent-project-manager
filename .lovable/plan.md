## Problem

The Manage Teams page (`ManageTeamsMain.tsx`) only lets you create/delete teams. There's no way to view members, invite, or remove people. The full member UI exists in `src/pages/Teams.tsx` but isn't reachable from the in-app sidebar.

## Plan

Enhance `ManageTeamsMain.tsx` so each team row is expandable and exposes full member management — mirroring the pattern already in `Teams.tsx` (reusing `useTeamMembers` + `useTeamInvites`).

### Changes

**1. `src/components/ManageTeamsMain.tsx`**
- Make each team card clickable to expand/collapse (one open at a time).
- When expanded, show a `TeamMembersSection` panel containing:
  - Member list with avatar, display name, @username, Owner badge.
  - Remove button (UserMinus icon) per non-owner member — visible only to team owner.
  - Invite-by-email form (Input + Send button) — visible only to team owner.
- Add a Pending Invites section at the top of the list (for the current user) with Accept / Decline actions, using `useTeamInvites`.
- Keep existing Create Team dialog and Delete team button.

**2. No backend / RLS changes**
- `useTeamMembers`, `useTeamInvites`, and existing policies already support invite/remove/accept/decline.
- No migration needed.

### Out of scope
- Editing a member's role (current schema only distinguishes `owner` vs `member`; no role editor today).
- Changes to the standalone `/teams` page.

### Technical notes
- Reuse the exact `TeamMembersSection` component logic from `src/pages/Teams.tsx` (extract inline into `ManageTeamsMain.tsx`, or import — extraction into a small shared component `src/components/TeamMembersSection.tsx` is cleaner and lets both screens use it).
- Owner check: `team.owner_id === user.id`.
- Expansion state: `const [expandedTeam, setExpandedTeam] = useState<string | null>(null)`.
