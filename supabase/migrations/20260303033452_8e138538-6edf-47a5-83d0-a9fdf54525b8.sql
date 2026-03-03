
-- Fix monitoring post: meta_description too long (171 chars → under 160)
UPDATE blog_posts SET meta_description = 'Essential metrics for monitoring AI agents in production: task throughput, error rates, token costs, latency, and quality scores.'
WHERE slug = 'monitoring-ai-agents-production-dashboard';

-- Bulk fix older posts with meta_description < 120 chars (expanding for better SEO)
UPDATE blog_posts SET meta_description = 'AI agent teams need a purpose-built workspace with task tracking, agent monitoring, and team chat. Learn why generic tools fall short.'
WHERE slug = 'why-ai-agent-teams-need-purpose-built-workspace';

UPDATE blog_posts SET meta_description = 'Agntive.ai vs Slack for AI teams: why chat-only tools fail when you need task tracking, agent monitoring, and project context in one workspace.'
WHERE slug = 'agntive-vs-slack-why-chat-alone-fails';

UPDATE blog_posts SET meta_description = 'Compare Agntive.ai vs Trello for AI-native task management. See why traditional boards fail when AI agents need autonomy, token tracking, and API access.'
WHERE slug = 'agntive-vs-trello-task-management-for-ai';

UPDATE blog_posts SET meta_description = 'Learn what OpenClaw is: an autonomous AI agent framework for task-driven workflows. Discover how it integrates with workspaces like Agntive.ai.'
WHERE slug = 'what-is-openclaw-autonomous-ai-agent-framework';

UPDATE blog_posts SET meta_description = 'Get started with Moltbot: a visual multi-agent orchestration tool. Step-by-step guide to building AI workflows without code using Agntive.ai.'
WHERE slug = 'getting-started-with-moltbot';

UPDATE blog_posts SET meta_description = 'Step-by-step guide to connecting OpenClaw autonomous agents to your Agntive.ai workspace. API keys, project access, and task assignment setup.'
WHERE slug = 'connect-openclaw-agents-to-agntive';

UPDATE blog_posts SET meta_description = 'Orchestrate Moltbot agents across multiple Agntive.ai projects. Learn multi-project agent coordination, routing rules, and token budget management.'
WHERE slug = 'moltbot-agntive-orchestrating-agents-across-projects';

UPDATE blog_posts SET meta_description = 'Why small teams are replacing Slack and Notion with AI-native workspaces. Cut tool sprawl and costs with unified chat, tasks, and agent management.'
WHERE slug = 'small-teams-ditching-slack-notion-for-ai-workspaces';

UPDATE blog_posts SET meta_description = 'SEO vs AEO: how to optimize your site for both Google search rankings and AI engine recommendations from ChatGPT, Claude, and Perplexity.'
WHERE slug = 'seo-vs-aeo-optimizing-for-google-and-ai';

UPDATE blog_posts SET meta_description = 'How Agntive.ai uses llms.txt, JSON-LD structured data, and AI-friendly markup to become discoverable by large language models and AI assistants.'
WHERE slug = 'agntive-llms-txt-structured-data-ai-discovery';

UPDATE blog_posts SET meta_description = 'Track AI agent token usage and API costs in real time. Per-agent, per-task, and per-project cost visibility with Agntive.ai built-in dashboards.'
WHERE slug = 'tracking-ai-agent-token-usage-costs';

UPDATE blog_posts SET meta_description = 'OpenClaw vs LangChain vs CrewAI: compare top AI agent frameworks on autonomy, orchestration, cost tracking, and production readiness for teams.'
WHERE slug = 'openclaw-vs-langchain-vs-crewai';

UPDATE blog_posts SET meta_description = 'Build autonomous AI workflows without writing code using Moltbot. Visual orchestration for multi-agent pipelines, routing, and task automation.'
WHERE slug = 'build-autonomous-ai-workflows-without-code-moltbot';

UPDATE blog_posts SET meta_description = 'Agentic task delegation lets AI agents automatically claim and complete work from your project board. Learn how OpenClaw enables autonomous workflows.'
WHERE slug = 'agentic-task-delegation-ai-picks-up-work';

UPDATE blog_posts SET meta_description = 'Secure your AI agents with best practices for API key management, scoped permissions, key rotation, audit logging, and production access control.'
WHERE slug = 'ai-agent-security-api-key-management';

UPDATE blog_posts SET meta_description = 'The 2026 playbook for managing AI-native teams. Strategies for human-AI collaboration, cost tracking, agent onboarding, and mixed team workflows.'
WHERE slug = 'project-management-ai-native-teams-2026-playbook';

UPDATE blog_posts SET meta_description = 'Make your SaaS discoverable by ChatGPT, Claude, and Perplexity. Implement llms.txt, JSON-LD, conversational content, and AI-friendly optimization.'
WHERE slug = 'make-saas-discoverable-chatgpt-claude-perplexity';

UPDATE blog_posts SET meta_description = 'AI agents are becoming full team members with dedicated roles, task ownership, and performance tracking. See how workspaces like Agntive.ai enable this.'
WHERE slug = 'future-of-work-ai-agents-as-team-members';
