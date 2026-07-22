Fix four "unfinished" spots on the landing page. Scope: presentation only, no logic changes.

## 1. ProblemSection — replace red
`src/components/landing/ProblemSection.tsx`
- Swap `--destructive` tokens (border, tile bg, icon color) for the blue accent (`--marketing-accent`) with subtle raised surface, matching the rest of the landing.
- Card: `border-white/10 bg-marketing-surface-raised`; icon tile: `bg-marketing-accent/10 border border-marketing-accent/25`; icon color: `text-marketing-accent`.

## 2. FeatureShowcase — feature tab chips
`src/components/landing/FeatureShowcase.tsx`
- Active chip currently reads white text on light-grey (broken look). Change to filled blue: `bg-marketing-accent text-white border-marketing-accent shadow` for active; inactive stays raised dark chip with `text-white/70`, hover lifts to white.

## 3. HowItWorks — step number tiles
`src/components/landing/HowItWorks.tsx`
- Numeric tiles (01–04) are light grey with white text = illegible. Change to dark raised tile with blue numeral: `bg-marketing-surface-raised border border-white/10`, number `text-marketing-accent font-mono`. Connector line uses `bg-white/10`.

## 4. Testimonials — avatar initials
`src/components/landing/Testimonials.tsx`
- Same light-grey/white issue on avatar. Change to `bg-marketing-accent/15 border border-marketing-accent/30 text-marketing-accent` for initials, keeping monochrome card. Name stays white, role stays muted.

## Notes
- No new tokens needed; `--marketing-accent`, `--marketing-surface-raised`, `--marketing-border` already exist in `src/index.css`.
- Red (`--destructive`) stays reserved for real destructive UI (delete actions) elsewhere in the app — only removing it from the marketing surface.
