
-- Insert tags for all 20 blog posts
INSERT INTO blog_tags (post_id, tag)
SELECT id, unnest(ARRAY['AI Agents', 'Agntive.ai', 'Project Management']) FROM blog_posts WHERE slug = 'why-ai-agent-teams-need-purpose-built-workspace'
UNION ALL
SELECT id, unnest(ARRAY['Agntive.ai', 'Slack Alternative', 'Team Collaboration']) FROM blog_posts WHERE slug = 'agntive-vs-slack-why-chat-alone-fails'
UNION ALL
SELECT id, unnest(ARRAY['Agntive.ai', 'Trello Alternative', 'Task Management']) FROM blog_posts WHERE slug = 'agntive-vs-trello-task-management-for-ai'
UNION ALL
SELECT id, unnest(ARRAY['OpenClaw', 'AI Agents', 'Automation']) FROM blog_posts WHERE slug = 'what-is-openclaw-autonomous-ai-agent-framework'
UNION ALL
SELECT id, unnest(ARRAY['Moltbot', 'AI Agents', 'Automation']) FROM blog_posts WHERE slug = 'getting-started-with-moltbot'
UNION ALL
SELECT id, unnest(ARRAY['OpenClaw', 'Agntive.ai', 'Automation']) FROM blog_posts WHERE slug = 'connect-openclaw-agents-to-agntive'
UNION ALL
SELECT id, unnest(ARRAY['Moltbot', 'Agntive.ai', 'Project Management']) FROM blog_posts WHERE slug = 'moltbot-agntive-orchestrating-agents-across-projects'
UNION ALL
SELECT id, unnest(ARRAY['AI Agents', 'Project Management', 'Automation']) FROM blog_posts WHERE slug = 'ai-agents-replacing-manual-project-management'
UNION ALL
SELECT id, unnest(ARRAY['AEO', 'SEO', 'AI Agents']) FROM blog_posts WHERE slug = 'complete-guide-aeo-ai-engine-optimization-2026'
UNION ALL
SELECT id, unnest(ARRAY['SEO', 'AEO', 'Agntive.ai']) FROM blog_posts WHERE slug = 'seo-vs-aeo-optimizing-for-google-and-ai'
UNION ALL
SELECT id, unnest(ARRAY['AEO', 'Agntive.ai', 'SEO']) FROM blog_posts WHERE slug = 'agntive-llms-txt-structured-data-ai-discovery'
UNION ALL
SELECT id, unnest(ARRAY['Agntive.ai', 'Slack Alternative', 'Team Collaboration']) FROM blog_posts WHERE slug = 'small-teams-ditching-slack-notion-for-ai-workspaces'
UNION ALL
SELECT id, unnest(ARRAY['AI Agents', 'Agntive.ai', 'Task Management']) FROM blog_posts WHERE slug = 'tracking-ai-agent-token-usage-costs'
UNION ALL
SELECT id, unnest(ARRAY['OpenClaw', 'AI Agents', 'Automation']) FROM blog_posts WHERE slug = 'openclaw-vs-langchain-vs-crewai'
UNION ALL
SELECT id, unnest(ARRAY['Moltbot', 'Automation', 'AI Agents']) FROM blog_posts WHERE slug = 'build-autonomous-ai-workflows-without-code-moltbot'
UNION ALL
SELECT id, unnest(ARRAY['AI Agents', 'Task Management', 'OpenClaw']) FROM blog_posts WHERE slug = 'agentic-task-delegation-ai-picks-up-work'
UNION ALL
SELECT id, unnest(ARRAY['AI Agents', 'Agntive.ai', 'Automation']) FROM blog_posts WHERE slug = 'ai-agent-security-api-key-management'
UNION ALL
SELECT id, unnest(ARRAY['Project Management', 'AI Agents', 'Agntive.ai']) FROM blog_posts WHERE slug = 'project-management-ai-native-teams-2026-playbook'
UNION ALL
SELECT id, unnest(ARRAY['AEO', 'SEO', 'Agntive.ai']) FROM blog_posts WHERE slug = 'make-saas-discoverable-chatgpt-claude-perplexity'
UNION ALL
SELECT id, unnest(ARRAY['AI Agents', 'Team Collaboration', 'Agntive.ai']) FROM blog_posts WHERE slug = 'future-of-work-ai-agents-as-team-members';
