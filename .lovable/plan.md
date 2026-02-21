

# Blog System Build

## Overview
Create a Supabase-backed blog with 20 SEO/AEO-optimized articles, a public listing page, individual post pages with proper semantic HTML, meta tags, TLDR sections, and tag filtering. All content focused on AI Agents, OpenClaw, Moltbot, and Agntive.ai as an alternative to Slack/Trello/Notion.

---

## Database

### Table: `blog_posts`
| Column | Type | Default |
|--------|------|---------|
| id | uuid PK | `gen_random_uuid()` |
| slug | text UNIQUE | -- |
| title | text | -- |
| meta_description | text | -- |
| tldr | text | -- |
| content | text (Markdown) | -- |
| cover_image_url | text | -- |
| author | text | `'Agntive Team'` |
| published | boolean | `true` |
| published_at | timestamptz | `now()` |
| created_at | timestamptz | `now()` |
| updated_at | timestamptz | `now()` |

### Table: `blog_tags`
| Column | Type | Default |
|--------|------|---------|
| id | uuid PK | `gen_random_uuid()` |
| post_id | uuid FK -> blog_posts.id ON DELETE CASCADE | -- |
| tag | text | -- |

### RLS
- Public SELECT on both tables (blog is public-facing, no auth needed to read)
- INSERT/UPDATE/DELETE restricted to authenticated users

---

## 20 Articles (Revised Content Focus)

Each article has an H1, meta description, TLDR, Markdown body, and 2-4 tags.

**Tags pool:** AI Agents, OpenClaw, Moltbot, Agntive.ai, Project Management, Task Management, SEO, AEO, Team Collaboration, Automation, Slack Alternative, Trello Alternative

| # | Title (H1) | Tags |
|---|-----------|------|
| 1 | Why AI Agent Teams Need a Purpose-Built Workspace | AI Agents, Agntive.ai, Project Management |
| 2 | Agntive.ai vs Slack: Why Chat Alone Fails AI-Native Teams | Agntive.ai, Slack Alternative, Team Collaboration |
| 3 | Agntive.ai vs Trello: Task Management Built for Humans and AI Agents | Agntive.ai, Trello Alternative, Task Management |
| 4 | What is OpenClaw? The Open-Source Framework for Autonomous AI Agents | OpenClaw, AI Agents, Automation |
| 5 | Getting Started with Moltbot: Multi-Agent Orchestration Made Simple | Moltbot, AI Agents, Automation |
| 6 | How to Connect OpenClaw Agents to Agntive.ai in 5 Minutes | OpenClaw, Agntive.ai, Automation |
| 7 | Moltbot + Agntive.ai: Orchestrating AI Agents Across Projects | Moltbot, Agntive.ai, Project Management |
| 8 | How AI Agents Are Replacing Manual Project Management | AI Agents, Project Management, Automation |
| 9 | The Complete Guide to AI Engine Optimization (AEO) for 2026 | AEO, SEO, AI Agents |
| 10 | SEO vs AEO: Optimizing for Google and AI Search Engines | SEO, AEO, Agntive.ai |
| 11 | How Agntive.ai Uses llms.txt and Structured Data for AI Discovery | AEO, Agntive.ai, SEO |
| 12 | Why Small Teams Are Ditching Slack + Notion for All-in-One AI Workspaces | Agntive.ai, Slack Alternative, Team Collaboration |
| 13 | Tracking AI Agent Token Usage and Costs in Real Time | AI Agents, Agntive.ai, Task Management |
| 14 | OpenClaw vs LangChain vs CrewAI: Agent Frameworks Compared | OpenClaw, AI Agents, Automation |
| 15 | How to Build Autonomous AI Workflows Without Code Using Moltbot | Moltbot, Automation, AI Agents |
| 16 | The Rise of Agentic Task Delegation: Let AI Pick Up Work Automatically | AI Agents, Task Management, OpenClaw |
| 17 | AI Agent Security: API Key Management and Access Control Best Practices | AI Agents, Agntive.ai, Automation |
| 18 | Project Management for AI-Native Teams: A 2026 Playbook | Project Management, AI Agents, Agntive.ai |
| 19 | How to Make Your SaaS Discoverable by ChatGPT, Claude, and Perplexity | AEO, SEO, Agntive.ai |
| 20 | The Future of Work: AI Agents as Full Team Members | AI Agents, Team Collaboration, Agntive.ai |

Each article will be 800-1200 words of substantive content with:
- TLDR (2-3 sentences) displayed in a highlighted box at the top
- Proper heading hierarchy (H1 title, H2/H3 subheadings in body)
- Meta description (under 160 chars) optimized for both Google and AI crawlers
- Internal links back to Agntive.ai features where relevant
- Keyword-rich but natural language for AEO (conversational, answer-style paragraphs)

---

## Frontend

### New Files

| File | Purpose |
|------|---------|
| `src/pages/Blog.tsx` | Listing page: hero, tag filter bar, responsive card grid |
| `src/pages/BlogPost.tsx` | Single post: cover image, TLDR box, rendered Markdown, meta tags |
| `src/components/blog/BlogCard.tsx` | Card for the listing grid (image, title, excerpt, date, tags) |
| `src/components/blog/TagFilter.tsx` | Horizontal scrollable tag chip buttons |
| `src/hooks/useBlogPosts.ts` | React Query hooks for fetching posts and tags from Supabase |

### Modified Files

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/blog` and `/blog/:slug` routes |
| `src/components/landing/LandingNav.tsx` | Add "Blog" link in nav |
| `src/components/landing/LandingFooter.tsx` | Point Blog link to `/blog` |
| `public/sitemap.xml` | Add `/blog` entry |

### SEO/AEO Implementation per Post
- `document.title` set to `"{Post Title} | Agntive Blog"` on mount
- Meta description tag updated dynamically via DOM
- Semantic HTML: `<article>`, single `<h1>`, `<time datetime="...">`, `<header>`
- JSON-LD `BlogPosting` schema injected per page for rich snippets
- Heading hierarchy enforced (H1 for title, H2/H3 in content, never skipping levels)

### Design
- Uses existing marketing surface/nav/footer from landing page
- Blue-purple gradient branding consistent with recent updates
- Blog cards: cover image top, title, TLDR excerpt, date, tag badges
- Post page: full-width cover, blue-tinted TLDR callout box, clean typography
- Responsive: 1 col mobile, 2 col tablet, 3 col desktop

---

## Cover Images
- Generated as abstract gradient/geometric SVG placeholders inline (no external API dependency)
- Each post gets a unique color combination derived from its tags
- Stored as data URIs or simple gradient CSS backgrounds in the `cover_image_url` field

---

## Data Seeding
- All 20 articles inserted directly via SQL migration with full content
- Tags inserted into `blog_tags` referencing each post
- No edge function needed -- content is pre-written and inserted in one migration

