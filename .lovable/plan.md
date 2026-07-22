## Goals

Fix the washed-out, wireframe feel of the redesigned landing without going back to purple. Restore the Agntive logo mark, deepen contrast, and introduce controlled blue + yellow accents alongside a broader grey scale so surfaces feel finished, not skeletal.

## Fixes

**1. Logo (top-left, currently invisible/missing on some viewports)**
- `HeroSection.tsx` and `LandingNav.tsx`: replace the plain `<div>` mark with a proper logo lockup — a filled rounded-sm tile containing a bold "A" glyph (Sora, tracking-tight) plus the "Agntive" wordmark. Ensure the mark uses `--marketing-text` on `--marketing-surface-alt` so it reads on both nav and hero shell.
- Make it a shared `<LandingLogo />` component in `src/components/landing/LandingLogo.tsx` so nav + hero + footer stay consistent.

**2. Palette — less washed, more depth (`src/index.css`)**

Refine marketing tokens (kept scoped to `--marketing-*`, no product theme change):

```text
--marketing-surface:        0 0% 5%      (near-black, slightly warmer)
--marketing-surface-alt:    220 13% 9%   (panel)
--marketing-surface-raised: 220 13% 12%  (cards, inspector items)
--marketing-border:         220 13% 18%  (crisper than current 23% L)
--marketing-border-strong:  220 13% 28%
--marketing-text:           0 0% 98%     (true white for headings)
--marketing-text-muted:     220 9% 62%
--marketing-text-dim:       220 9% 42%
--marketing-accent:         210 100% 60% (electric blue — CTA + status)
--marketing-accent-soft:    210 80% 70%
--marketing-warning:        45 100% 60%  (yellow — highlight/badge accent)
--marketing-success:        142 60% 50%  (kept for status pills)
```

**3. Apply the new tokens where things feel skeletal**

- **Nav (`LandingNav.tsx`)**: primary CTA becomes `bg-[--marketing-accent] text-black` (blue button, not white); announcement bar pulse dot switches to yellow; nav border uses `--marketing-border`.
- **Hero (`HeroSection.tsx`)**:
  - Headline: white; accent word "AI agents" wrapped in a subtle yellow underline (`border-b-2 border-[--marketing-warning]`) instead of grey-on-grey.
  - Primary CTA: blue fill, black text; secondary CTA keeps outline but uses `--marketing-border-strong`.
  - `SYSTEM_ACTIVE` badge: yellow dot + white text on `--marketing-surface-raised`.
  - Activity feed `[TASK]`/`[AGENT]`/`[CHAT]` tags: colorize (blue / yellow / white) instead of all blue — gives the terminal panel life.
  - Throughput bars: gradient of grey→blue for the tallest bar; remaining bars use `--marketing-border-strong` (currently too faint).
  - Inspector cards: `bg-[--marketing-surface-raised]` with `border-[--marketing-border]`; label icons tint blue.
  - Icon rail: active item gets a 2px left blue bar.
- **PricingSection.tsx**: featured tier ("Team") gets blue border + subtle blue glow (`shadow-[0_0_0_1px_hsl(var(--marketing-accent)/0.6)]`), price numerals in white, "$5" unit in yellow. Non-featured tiers use `--marketing-surface-raised` fill so cards read as cards, not empty frames.
- **StatsSection.tsx**: giant numerals in white; unit suffix (`x`, `%`) in yellow. Dividers use `--marketing-border-strong`.
- **AgentDeepDive.tsx / FinalCTA.tsx**: swap any remaining `bg-white/[0.02]` empty panels for `--marketing-surface-raised` and give the primary CTA the blue fill treatment.

**4. Finish pass — remove the wireframe feel**

- Replace the current `bg-white/5` and `bg-white/[0.02]` washes with the real `--marketing-surface-raised` token so panels have actual fill.
- Add a subtle 1px inner top highlight on cards (`shadow-[inset_0_1px_0_hsl(0_0%_100%/0.04)]`) for depth.
- Radial dot grid opacity bumped from 0.04 → 0.08 so the hero backdrop is visible without being noisy.
- Tighten all border colors to the new `--marketing-border` — the current 23% lightness reads muddy.

## Files touched

- `src/index.css` — token refresh (marketing scope only)
- `src/components/landing/LandingLogo.tsx` — new shared component
- `src/components/landing/LandingNav.tsx` — logo + CTA colors
- `src/components/landing/HeroSection.tsx` — logo, CTA, accent colorization, panel fills
- `src/components/landing/PricingSection.tsx` — featured tier accent, card fills
- `src/components/landing/StatsSection.tsx` — numeral + suffix color
- `src/components/landing/AgentDeepDive.tsx` — panel fills, CTA
- `src/components/landing/FinalCTA.tsx` — CTA color

## Out of scope

- Product app theme (`--background`, `--primary`, etc.) — unchanged.
- No layout restructuring; this is a color, contrast, and logo pass only.
