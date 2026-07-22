## Redesign: monochrome tool surface

Rebuild the landing page around the picked "Monochrome tool surface" direction. Locked: greyscale palette (#0a0a0a / #2d3748 / #a0aec0 / #e5e7eb), Sora headings + Manrope body + JetBrains Mono for readouts, blue only as a rare status accent. Strip all purple gradients, glowy shadows, and rainbow icon tiles.

### 1. Fonts + tokens

- `index.html`: preconnect + load Sora, Manrope, JetBrains Mono.
- `tailwind.config.ts`: extend `fontFamily` with `sora`, `manrope`, `mono`.
- `src/index.css`: repoint marketing tokens to greyscale.
  - `--marketing-surface: 0 0% 4%` (#0a0a0a), `--marketing-surface-alt: 0 0% 6%`.
  - `--marketing-text: 220 14% 91%` (#e5e7eb), `--marketing-text-muted: 214 20% 65%` (#a0aec0).
  - `--marketing-accent: 217 91% 60%` (blue, used sparingly for status only).
  - Replace `--marketing-gradient-start/mid/end` with three near-identical greys so any legacy gradient reads as a flat monochrome bar.
  - Same values in `:root` and `.dark` (page is dark either way).
- Add `.font-display { font-family: 'Sora', ui-sans-serif; }` and set body font to Manrope via Tailwind `font-manrope`.

### 2. HeroSection

Rewrite `src/components/landing/HeroSection.tsx` as the dashboard-shell hero from the picked prototype:
- Bordered `max-w-6xl` shell with 1px `#2d3748` rules, sharp corners (`rounded-sm`).
- Top bar: Agntive mark + workspace/deployments/library nav + `SYSTEM_ACTIVE` pill (pulsing blue dot) + white "Start free" button linking to `/auth`.
- Left icon rail (w-16) with 3 stroke icons.
- Center panel: mono status chip, `font-display` H1 "One workspace for your team and AI agents." with muted second line, muted subhead, two CTAs (solid white "Start free", outlined "Read the docs" → `/docs`).
- Bottom row: TERMINAL_FEED panel (JetBrains Mono log rows including a bot task line) + METRICS bar chart with LATENCY readout.
- Right auxiliary column (xl+): INSPECTOR with TASKS / AGENTS / TIME_TRACKED cards using real product nouns, not "LLM_ORCHESTRATOR" placeholder copy.
- Product-accurate copy throughout — no invented "vector store / TFLOPs" language. Keep it about tasks, chat, agents, time tracking.

### 3. LandingNav

Rewrite `src/components/landing/LandingNav.tsx`:
- Drop the purple gradient announcement bar; replace with a thin monochrome strip: mono type, small blue dot, "New — OpenClaw integration".
- Nav bar: black bg, hairline bottom border, Sora wordmark, muted links, ghost "Log in", solid white "Start free" (no gradient).
- Theme toggle stays but restyled to match.

### 4. Downstream sections

`ProblemSection`, `FeatureShowcase`, `OpenClawSection`, `HowItWorks`, `AgentDeepDive`, `PricingSection`, `StatsSection`, `Testimonials`, `FAQSection`, `FinalCTA`, `LandingFooter` already consume `--marketing-*` tokens, so the token flip alone removes purple. In addition:
- `AgentDeepDive.tsx`: remove the `from-...gradient-start/0.1` icon-tile background and the accent-color hover shadow; use a flat bordered square with a mono icon, and swap capability pills for `border border-[#2d3748]` chips.
- `FinalCTA.tsx` and `PricingSection.tsx`: replace any `bg-gradient-to-r` CTAs with solid `bg-[#e5e7eb] text-[#0a0a0a]` buttons (matching hero).
- `StatsSection.tsx`: numbers in Sora, thin rules between stats.
- No other structural changes to these files — copy stays, only classNames adjust.

### 5. Global body font

- `src/index.css` body rule: add `font-family: 'Manrope', ui-sans-serif, system-ui, sans-serif;` so the whole marketing surface reads Manrope by default and Sora only where `font-display` is applied.

### Out of scope

- App/product routes (`/`, `/auth`, dashboard) — untouched. Redesign is marketing surface only.
- No new sections, no new imagery, no logo change.

### Verification

After edits: `curl` localhost:8080, screenshot the landing hero via Playwright at 1440×900, compare against picked prototype. Confirm zero purple pixels in hero region.
