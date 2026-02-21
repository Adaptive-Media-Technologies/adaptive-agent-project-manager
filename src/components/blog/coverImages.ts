import cover1 from '@/assets/blog/cover-1-ai-workspace.jpg';
import cover2 from '@/assets/blog/cover-2-slack-vs.jpg';
import cover3 from '@/assets/blog/cover-3-trello-vs.jpg';
import cover4 from '@/assets/blog/cover-4-openclaw.jpg';
import cover5 from '@/assets/blog/cover-5-moltbot.jpg';
import cover6 from '@/assets/blog/cover-6-connect.jpg';
import cover7 from '@/assets/blog/cover-7-orchestrate.jpg';
import cover8 from '@/assets/blog/cover-8-replacing-pm.jpg';
import cover9 from '@/assets/blog/cover-9-aeo.jpg';
import cover10 from '@/assets/blog/cover-10-seo-vs-aeo.jpg';
import cover11 from '@/assets/blog/cover-11-structured-data.jpg';
import cover12 from '@/assets/blog/cover-12-ditching-slack.jpg';
import cover13 from '@/assets/blog/cover-13-token-tracking.jpg';
import cover14 from '@/assets/blog/cover-14-frameworks.jpg';
import cover15 from '@/assets/blog/cover-15-nocode.jpg';
import cover16 from '@/assets/blog/cover-16-delegation.jpg';
import cover17 from '@/assets/blog/cover-17-security.jpg';
import cover18 from '@/assets/blog/cover-18-playbook.jpg';
import cover19 from '@/assets/blog/cover-19-discoverable.jpg';
import cover20 from '@/assets/blog/cover-20-future.jpg';

const coverImages: Record<string, string> = {
  'why-ai-agent-teams-need-purpose-built-workspace': cover1,
  'agntive-vs-slack-why-chat-alone-fails': cover2,
  'agntive-vs-trello-task-management-for-ai': cover3,
  'what-is-openclaw-autonomous-ai-agent-framework': cover4,
  'getting-started-with-moltbot': cover5,
  'connect-openclaw-agents-to-agntive': cover6,
  'moltbot-agntive-orchestrating-agents-across-projects': cover7,
  'ai-agents-replacing-manual-project-management': cover8,
  'complete-guide-aeo-ai-engine-optimization-2026': cover9,
  'seo-vs-aeo-optimizing-for-google-and-ai': cover10,
  'agntive-llms-txt-structured-data-ai-discovery': cover11,
  'small-teams-ditching-slack-notion-for-ai-workspaces': cover12,
  'tracking-ai-agent-token-usage-costs': cover13,
  'openclaw-vs-langchain-vs-crewai': cover14,
  'build-autonomous-ai-workflows-without-code-moltbot': cover15,
  'agentic-task-delegation-ai-picks-up-work': cover16,
  'ai-agent-security-api-key-management': cover17,
  'project-management-ai-native-teams-2026-playbook': cover18,
  'make-saas-discoverable-chatgpt-claude-perplexity': cover19,
  'future-of-work-ai-agents-as-team-members': cover20,
};

export const getCoverImage = (slug: string): string | undefined => coverImages[slug];
