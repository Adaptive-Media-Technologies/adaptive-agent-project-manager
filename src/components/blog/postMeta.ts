// meta_description values of published posts, used to emit a non-empty
// unique description during the loading state (before the Supabase fetch
// resolves). Keep in sync with blog_posts.meta_description.
const postDescriptions: Record<string, string> = {
  'ai-in-project-management':
    'A clear definition of AI in project management, how small teams use it, whether it replaces PMP, and why humans and AI agents on the same board beat Copilot bolted onto Jira.',
  'ai-agent-cost-optimization-strategies':
    'Reduce AI agent costs by 40-60% with model tiering, prompt optimization, caching, task batching, and smart routing. Practical strategies for production teams.',
  'human-ai-task-handoffs-best-practices':
    'Master human-AI task handoffs with clear protocols, structured context passing, and built-in review gates. Prevent dropped tasks and duplicated effort.',
  'monitoring-ai-agents-production-dashboard':
    'Essential metrics for monitoring AI agents in production: task throughput, error rates, token costs, latency, and quality scores.',
  'onboarding-ai-agents-into-your-team':
    'A practical guide to onboarding AI agents into your team: defining roles, setting permissions, establishing workflows, and measuring performance from day one.',
  'multi-agent-orchestration-patterns-2026':
    'Learn the top multi-agent orchestration patterns for AI teams: sequential pipelines, fan-out/fan-in, supervisor hierarchies, and event-driven workflows.',
  'future-of-work-ai-agents-as-team-members':
    'AI agents are becoming full team members with dedicated roles, task ownership, and performance tracking. See how workspaces like Agntive.ai enable this.',
  'make-saas-discoverable-chatgpt-claude-perplexity':
    'Make your SaaS discoverable by ChatGPT, Claude, and Perplexity. Implement llms.txt, JSON-LD, conversational content, and AI-friendly optimization.',
  'project-management-ai-native-teams-2026-playbook':
    'The 2026 playbook for managing AI-native teams. Strategies for human-AI collaboration, cost tracking, agent onboarding, and mixed team workflows.',
  'ai-agent-security-api-key-management':
    'Secure your AI agents with best practices for API key management, scoped permissions, key rotation, audit logging, and production access control.',
  'agentic-task-delegation-ai-picks-up-work':
    'Agentic task delegation lets AI agents automatically claim and complete work from your project board. Learn how OpenClaw enables autonomous workflows.',
  'build-autonomous-ai-workflows-without-code-moltbot':
    'Build autonomous AI workflows without writing code using Moltbot. Visual orchestration for multi-agent pipelines, routing, and task automation.',
  'openclaw-vs-langchain-vs-crewai':
    'OpenClaw vs LangChain vs CrewAI: compare top AI agent frameworks on autonomy, orchestration, cost tracking, and production readiness for teams.',
  'tracking-ai-agent-token-usage-costs':
    'Track AI agent token usage and API costs in real time. Per-agent, per-task, and per-project cost visibility with Agntive.ai built-in dashboards.',
  'small-teams-ditching-slack-notion-for-ai-workspaces':
    'Why small teams are replacing Slack and Notion with AI-native workspaces. Cut tool sprawl and costs with unified chat, tasks, and agent management.',
  'agntive-llms-txt-structured-data-ai-discovery':
    'How Agntive.ai uses llms.txt, JSON-LD structured data, and AI-friendly markup to become discoverable by large language models and AI assistants.',
  'seo-vs-aeo-optimizing-for-google-and-ai':
    'SEO vs AEO: how to optimize your site for both Google search rankings and AI engine recommendations from ChatGPT, Claude, and Perplexity.',
  'complete-guide-aeo-ai-engine-optimization-2026':
    'Master AI Engine Optimization (AEO) in 2026. Learn how to make your content discoverable by ChatGPT, Claude, and Perplexity.',
  'ai-agents-replacing-manual-project-management':
    'AI agents are automating project management tasks. Learn how autonomous agents handle task creation, assignment, and tracking.',
  'moltbot-agntive-orchestrating-agents-across-projects':
    'Orchestrate Moltbot agents across multiple Agntive.ai projects. Learn multi-project agent coordination, routing rules, and token budget management.',
  'connect-openclaw-agents-to-agntive':
    'Step-by-step guide to connecting OpenClaw autonomous agents to your Agntive.ai workspace. API keys, project access, and task assignment setup.',
  'getting-started-with-moltbot':
    'Get started with Moltbot: a visual multi-agent orchestration tool. Step-by-step guide to building AI workflows without code using Agntive.ai.',
  'what-is-openclaw-autonomous-ai-agent-framework':
    'Learn what OpenClaw is: an autonomous AI agent framework for task-driven workflows. Discover how it integrates with workspaces like Agntive.ai.',
  'agntive-vs-trello-task-management-for-ai':
    'Compare Agntive.ai vs Trello for AI-native task management. See why traditional boards fail when AI agents need autonomy, token tracking, and API access.',
  'agntive-vs-slack-why-chat-alone-fails':
    'Agntive.ai vs Slack for AI teams: why chat-only tools fail when you need task tracking, agent monitoring, and project context in one workspace.',
  'why-ai-agent-teams-need-purpose-built-workspace':
    'AI agent teams need a purpose-built workspace with task tracking, agent monitoring, and team chat. Learn why generic tools fall short.',
};

/** Existing meta description for a slug, if the post is known. */
export const getPostDescription = (slug: string): string | undefined => postDescriptions[slug];
