

# Marketing Page Content Overhaul

## Summary
Rewrite all landing page copy to position Agntive.ai as a **task-driven workspace for teams and agentic AI**, emphasizing that it replaces Slack, Notion, Google Keep, and generic bots with one unified platform. Replace every "Get Started Free" CTA with "Start 14-Day Free Trial".

---

## Changes by File

### 1. `index.html` -- SEO meta tags
- **Title**: "Agntive.ai -- Task-Driven Workspace for Teams & AI Agents"
- **Description**: "Unify messaging, task tracking, project context, and autonomous AI agents in one smart workspace. Replace Slack, Notion, and generic bots. Start your 14-day free trial."
- **Keywords**: "AI team workspace, agentic AI collaboration, task management AI agents, AI project management, team AI automation, replace Slack Notion"
- Update og:title, og:description, twitter:title, twitter:description to match

### 2. `LandingNav.tsx`
- Nav CTA button: "Get Started Free" --> "Start Free Trial"
- Announcement bar text: "Give your AI agents a project manager" --> "One workspace for your team and AI agents"

### 3. `HeroSection.tsx`
- **H1**: "One workspace for your team and AI agents" with gradient on "AI agents"
- **Subtitle**: "Agntive unifies messaging, task tracking, and autonomous AI automation into a single smart workspace -- so small teams stop juggling Slack, Notion, and generic bots."
- **Primary CTA**: "Start 14-Day Free Trial"
- **Trust badges**: "Free forever" --> "14-day free trial" / keep "No credit card required" / keep "Set up in 2 minutes"

### 4. `ProblemSection.tsx`
- **Heading**: "Your team is drowning in disconnected tools"
- **Subtitle**: "Slack for chat, Notion for docs, Google Keep for notes, random bots for AI. Context gets lost, work falls through the cracks."
- **Problem cards**:
  1. "Work scattered across apps" -- "Conversations in Slack, tasks in Notion, notes in Keep. No single source of truth for what your team -- or your AI agents -- are doing."
  2. "AI agents with zero coordination" -- "Your AI agents run tasks in silos. No shared context, no visibility into what they did, and no connection to team workflows."
  3. "Context switching kills momentum" -- "Jumping between five apps to manage one project. Every switch costs focus time your small team can't afford."

### 5. `FeatureShowcase.tsx`
- **Section heading**: "Everything your team needs in one workspace"
- **Subtitle**: "Messaging, tasks, AI automation, and project context -- unified so nothing falls through the cracks."
- Tab descriptions updated:
  - **Task Management headline**: "Tasks designed for humans and AI agents" / description about assigning to both
  - **Agent Tracking headline**: "Monitor your AI agents in real-time" / description about visibility
  - **Time & Token Logs headline**: "Track every hour and every token" / description about cost awareness
  - **Team Chat headline**: "Conversations that live with your work" / description about replacing Slack with in-context chat
  - **Calendar headline**: "Every deadline, one unified view"
  - **API headline**: "Connect any AI agent via API" / description about REST + webhooks

### 6. `OpenClawSection.tsx`
- **Heading**: "Native OpenClaw integration" (keep but update subtitle)
- **Subtitle**: "Connect OpenClaw agents to your workspace. They pick up tasks, report progress, and log token usage -- automatically."

### 7. `HowItWorks.tsx`
- **Heading**: "Up and running in minutes"
- **Subtitle**: "Four steps from sign-up to a fully coordinated team + AI workspace."
- Steps:
  1. "Create your workspace" -- "Sign up and invite your team. Your workspace is ready in seconds."
  2. "Bring your tools together" -- "Connect AI agents via API, set up project boards, and start conversations -- all in one place."
  3. "Assign work to humans and agents" -- "Create tasks, assign them to team members or AI agents, and track progress in real-time."
  4. "Ship faster, together" -- "Chat, track, and automate in context. No more app-switching, no more lost threads."

### 8. `AgentDeepDive.tsx`
- **Heading**: "Humans and AI agents, working as one team"
- **Subtitle**: "Give every agent a seat at the table alongside your human teammates."

### 9. `StatsSection.tsx`
- Stats:
  - "1" / "workspace instead of five apps"
  - "10x" / "faster coordination between humans and AI"
  - "100%" / "visibility across all team and agent activity"

### 10. `Testimonials.tsx`
- **Heading**: "Teams building with Agntive"
- Update quotes to reference replacing multiple tools, unified workspace benefits

### 11. `FinalCTA.tsx`
- **Heading**: "Ready to unify your team and AI agents?"
- **Subtitle**: "Join teams already using Agntive to replace scattered tools with one smart workspace."
- **CTA button**: "Start 14-Day Free Trial"

### 12. `LogoBar.tsx`
- **Label**: "Trusted by AI-first teams" --> "Trusted by teams shipping with AI"

### 13. `LandingFooter.tsx`
- **Tagline**: "The task-driven workspace for teams and AI agents. Messaging, tasks, and automation in one place."

---

## Technical Details

| File | Type of Change |
|---|---|
| `index.html` | Meta tag text updates |
| `src/components/landing/LandingNav.tsx` | Button label + announcement text |
| `src/components/landing/HeroSection.tsx` | H1, subtitle, CTA label, trust badges |
| `src/components/landing/ProblemSection.tsx` | Heading, subtitle, all 3 card texts |
| `src/components/landing/FeatureShowcase.tsx` | Section heading, subtitle, all 6 tab headlines + descriptions |
| `src/components/landing/OpenClawSection.tsx` | Subtitle text |
| `src/components/landing/HowItWorks.tsx` | Heading, subtitle, all 4 step texts |
| `src/components/landing/AgentDeepDive.tsx` | Heading + subtitle |
| `src/components/landing/StatsSection.tsx` | All 3 stat values + labels |
| `src/components/landing/Testimonials.tsx` | Heading + updated quotes |
| `src/components/landing/FinalCTA.tsx` | Heading, subtitle, CTA label |
| `src/components/landing/LogoBar.tsx` | Label text |
| `src/components/landing/LandingFooter.tsx` | Tagline text |

All changes are text/copy only -- no structural, layout, or styling changes needed.

