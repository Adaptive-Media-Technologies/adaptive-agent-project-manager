
# Agntive.ai Landing Page Overhaul

## Overview

Transform the current short landing page into a long-form, high-converting homepage inspired by ClickUp's structure, with AI agent task management as the unique differentiator and a dedicated OpenClaw integration section.

## Current State

The existing `LandingPage.tsx` has 5 sections: Nav, Hero, 6-card Features grid, 3-step How It Works, and a CTA banner. It's ~200 lines and feels like a template rather than a product homepage.

## New Page Structure (12 sections)

### 1. Sticky Nav (enhanced)
- Add more nav links: Features, Integrations, How It Works, Pricing
- Add an announcement bar at the very top (e.g. "NEW: OpenClaw Integration - Give your AI agents a project manager")

### 2. Hero (rewritten)
- Bold headline: "The project manager your AI agents actually need"
- Sub-headline emphasizing the unique angle: humans and AI agents working side-by-side with full visibility
- Animated gradient text for the key phrase
- Two CTAs: "Get Started Free" + "Watch Demo" (ghost button)
- Below the CTA: a mock screenshot/illustration of the app dashboard built with CSS (showing the sidebar, task list, and an agent avatar completing a task)

### 3. Logo Bar / Social Proof
- "Trusted by AI-first teams" with placeholder company logos or community stats
- Subtle auto-scrolling marquee effect

### 4. Problem Statement Section
- "Your AI agents are working in the dark" - a bold callout section
- Three pain points shown as cards: No visibility into agent activity, Token costs spiraling without tracking, No way to coordinate humans + agents
- Uses alternating icon + text layout

### 5. Feature Showcase (tabbed/interactive)
- Replace the static grid with a tabbed section inspired by ClickUp's feature tabs
- Tabs: Task Management, Agent Tracking, Time & Token Logs, Team Chat, Calendar, API & Automations
- Each tab shows a headline, description, and a CSS-illustrated mockup of that feature
- The active tab highlights with the purple gradient

### 6. OpenClaw Integration Section (NEW - dedicated)
- Full-width section with a dark background (matching OpenClaw's dark aesthetic)
- OpenClaw logo + "Powered by OpenClaw" badge
- Headline: "Give OpenClaw a command center"
- Description: OpenClaw agents connect to Agntive via API, automatically logging tasks, tracking token usage, and reporting status in real-time
- Three integration highlights:
  - "Assign tasks from chat" - OpenClaw picks up tasks and updates status
  - "Automatic token tracking" - Every API call logged and attributed
  - "Real-time status updates" - See your agents working live in the dashboard
- CTA: "Connect OpenClaw" button + link to docs

### 7. How It Works (expanded to 4 steps)
- Step 1: Create your workspace
- Step 2: Connect your AI agents (OpenClaw, custom agents via API)
- Step 3: Assign tasks and track progress
- Step 4: Ship faster with human + AI collaboration
- Each step with a numbered badge and brief description
- Connected by a vertical line/timeline on desktop

### 8. AI Agent Management Deep-Dive
- "A new era of human + agent collaboration" (inspired by ClickUp's "Super Agents" section)
- Three illustrated use-cases:
  - Code Agent: auto-creates PRs, updates task status, logs time
  - Research Agent: gathers data, summarizes findings, attaches to tasks
  - Ops Agent: monitors deployments, creates incident tasks, notifies team
- Each with a mini card showing the agent type and what it does

### 9. Stats / Impact Section
- Large numbers in gradient text:
  - "10x faster task completion with AI agents"
  - "Zero token waste with usage tracking"
  - "100% visibility across human + AI work"

### 10. Testimonials / Social Proof
- Quote cards from hypothetical users (placeholder content)
- Similar layout to OpenClaw's testimonial wall but with 3-4 featured quotes

### 11. Final CTA Banner
- Full-width gradient banner (keep existing style)
- "Ready to put your AI agents to work?"
- Get Started Free button

### 12. Footer (expanded)
- Multi-column layout: Product, Resources, Company, Legal
- Social links
- Copyright

## Technical Details

### File changes:
- **`src/pages/LandingPage.tsx`**: Complete rewrite with all 12 sections. The file will grow to approximately 600-800 lines. Each section will be a clearly commented block within the component.

### New CSS additions to `src/index.css`:
- Marquee animation keyframes for the logo bar
- A subtle "float" animation for the dashboard mockup in the hero
- Tab indicator transition styles

### Component approach:
- Everything stays in `LandingPage.tsx` as inline sections (no new component files needed)
- CSS mockups of the dashboard/features will be built with Tailwind utility classes and border/shadow tricks rather than actual screenshots
- All responsive - mobile-first with `md:` and `lg:` breakpoints

### Design tokens used:
- All existing `--marketing-*` CSS variables will be reused
- The OpenClaw section will use inline dark background colors (no new variables needed)
- Gradient accents continue using `--marketing-gradient-start/mid/end`

### No new dependencies required
- All animations via CSS keyframes and Tailwind
- Tab switching via React `useState`
- No external carousel or animation libraries

