// Titles of published posts, used only to render a real <h1> during the
// loading state (before the Supabase fetch resolves). Keep in sync with blog_posts.
const postTitles: Record<string, string> = {
  'ai-in-project-management': 'AI in project management: a practical guide for small teams',
  'ai-agent-cost-optimization-strategies': '7 Strategies to Cut AI Agent Costs Without Sacrificing Quality',
  'human-ai-task-handoffs-best-practices': 'Human-AI Task Handoffs: How to Avoid Dropped Balls and Wasted Work',
  'monitoring-ai-agents-production-dashboard': 'Monitoring AI Agents in Production: What to Track and Why',
  'onboarding-ai-agents-into-your-team': 'How to Onboard AI Agents Into Your Team Like New Hires',
  'multi-agent-orchestration-patterns-2026': 'Multi-Agent Orchestration Patterns Every Team Should Know in 2026',
  'future-of-work-ai-agents-as-team-members': 'The Future of Work: AI Agents as Full Team Members',
  'make-saas-discoverable-chatgpt-claude-perplexity': 'How to Make Your SaaS Discoverable by ChatGPT, Claude, and Perplexity',
  'project-management-ai-native-teams-2026-playbook': 'Project Management for AI-Native Teams: A 2026 Playbook',
  'ai-agent-security-api-key-management': 'AI Agent Security: API Key Management and Access Control Best Practices',
  'agentic-task-delegation-ai-picks-up-work': 'The Rise of Agentic Task Delegation: Let AI Pick Up Work Automatically',
  'build-autonomous-ai-workflows-without-code-moltbot': 'How to Build Autonomous AI Workflows Without Code Using Moltbot',
  'openclaw-vs-langchain-vs-crewai': 'OpenClaw vs LangChain vs CrewAI: Agent Frameworks Compared',
  'tracking-ai-agent-token-usage-costs': 'Tracking AI Agent Token Usage and Costs in Real Time',
  'small-teams-ditching-slack-notion-for-ai-workspaces': 'Why Small Teams Are Ditching Slack + Notion for All-in-One AI Workspaces',
  'agntive-llms-txt-structured-data-ai-discovery': 'How Agntive.ai Uses llms.txt and Structured Data for AI Discovery',
  'seo-vs-aeo-optimizing-for-google-and-ai': 'SEO vs AEO: Optimizing for Google and AI Search Engines',
  'complete-guide-aeo-ai-engine-optimization-2026': 'The Complete Guide to AI Engine Optimization (AEO) for 2026',
  'ai-agents-replacing-manual-project-management': 'How AI Agents Are Replacing Manual Project Management',
  'moltbot-agntive-orchestrating-agents-across-projects': 'Moltbot + Agntive.ai: Orchestrating AI Agents Across Projects',
  'connect-openclaw-agents-to-agntive': 'How to Connect OpenClaw Agents to Agntive.ai in 5 Minutes',
  'getting-started-with-moltbot': 'Getting Started with Moltbot: Multi-Agent Orchestration Made Simple',
  'what-is-openclaw-autonomous-ai-agent-framework': 'What is OpenClaw? The Open-Source Framework for Autonomous AI Agents',
  'agntive-vs-trello-task-management-for-ai': 'Agntive.ai vs Trello: Task Management Built for Humans and AI Agents',
  'agntive-vs-slack-why-chat-alone-fails': 'Agntive.ai vs Slack: Why Chat Alone Fails AI-Native Teams',
  'why-ai-agent-teams-need-purpose-built-workspace': 'Why AI Agent Teams Need a Purpose-Built Workspace',
};

const humanize = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

/** Non-empty, unique heading for a slug — falls back to a humanized slug. */
export const getPostTitle = (slug: string): string => postTitles[slug] ?? humanize(slug);
