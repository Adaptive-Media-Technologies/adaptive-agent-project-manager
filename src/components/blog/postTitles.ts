// Titles of published posts, used only to render a real <h1> during the
// loading state (before the Supabase fetch resolves). Keep in sync with blog_posts.
const postTitles: Record<string, string> = {
  'ai-in-project-management': 'AI in Project Management: A Small-Team Guide',
  'ai-agent-cost-optimization-strategies': '7 Ways to Cut AI Agent Costs',
  'human-ai-task-handoffs-best-practices': 'Human-AI Task Handoffs: Avoid Dropped Balls',
  'monitoring-ai-agents-production-dashboard': 'Monitoring AI Agents in Production',
  'onboarding-ai-agents-into-your-team': 'Onboard AI Agents Like New Hires',
  'multi-agent-orchestration-patterns-2026': 'Multi-Agent Orchestration Patterns for 2026',
  'future-of-work-ai-agents-as-team-members': 'The Future of Work: AI Agents as Full Team Members',
  'make-saas-discoverable-chatgpt-claude-perplexity': 'Get Your SaaS Found by ChatGPT and Perplexity',
  'project-management-ai-native-teams-2026-playbook': 'Project Management for AI-Native Teams',
  'ai-agent-security-api-key-management': 'AI Agent Security: API Keys and Access Control',
  'agentic-task-delegation-ai-picks-up-work': 'Agentic Task Delegation: Let AI Pick Up Work',
  'build-autonomous-ai-workflows-without-code-moltbot': 'Build Autonomous AI Workflows Without Code',
  'openclaw-vs-langchain-vs-crewai': 'OpenClaw vs LangChain vs CrewAI',
  'tracking-ai-agent-token-usage-costs': 'Track AI Agent Token Usage and Costs',
  'small-teams-ditching-slack-notion-for-ai-workspaces': 'Why Small Teams Are Ditching Slack + Notion',
  'agntive-llms-txt-structured-data-ai-discovery': 'llms.txt and Structured Data for AI Discovery',
  'seo-vs-aeo-optimizing-for-google-and-ai': 'SEO vs AEO: Optimizing for Google and AI',
  'complete-guide-aeo-ai-engine-optimization-2026': 'Complete Guide to AI Engine Optimization (AEO)',
  'ai-agents-replacing-manual-project-management': 'AI Agents Are Replacing Manual Project Work',
  'moltbot-agntive-orchestrating-agents-across-projects': 'Orchestrating AI Agents Across Projects',
  'connect-openclaw-agents-to-agntive': 'Connect OpenClaw Agents to Agntive.ai',
  'getting-started-with-moltbot': 'Getting Started with Moltbot Orchestration',
  'what-is-openclaw-autonomous-ai-agent-framework': 'What Is OpenClaw? Autonomous AI Agent Framework',
  'agntive-vs-trello-task-management-for-ai': 'Agntive.ai vs Trello: Tasks for Humans and AI',
  'agntive-vs-slack-why-chat-alone-fails': 'Agntive.ai vs Slack: Why Chat Alone Fails',
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
