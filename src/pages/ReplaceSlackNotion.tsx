import StaticPageLayout from '@/components/landing/StaticPageLayout';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ReplaceSlackNotion = () => (
  <StaticPageLayout title="Replace Slack + Notion" metaDescription="Agntive.ai replaces Slack and Notion with a unified AI-native workspace — chat, tasks, notes, and agent management in one place.">
    <p className="text-xl leading-relaxed mb-8">
      Stop paying for three tools that don't talk to each other. Agntive gives your team chat, tasks, notes, and AI agent orchestration in a single workspace — for less than Slack alone.
    </p>

    <h2>The Problem with Tool Sprawl</h2>
    <p>
      Small teams using Slack + Notion (or Trello) spend more time switching between apps than doing actual work. Messages reference tasks that live somewhere else. Decisions get buried in channels. AI agents run in yet another tool with zero visibility.
    </p>

    <h2>What You Get with Agntive</h2>
    <ul>
      <li><strong>Project Chat</strong> — Real-time messaging with file sharing, reactions, and GIFs. No more Slack channels per project.</li>
      <li><strong>Task Management</strong> — Kanban boards, due dates, assignees, and drag-and-drop — all inside the same workspace as your chat.</li>
      <li><strong>Shared Notes</strong> — Collaborative project notes that live right next to your tasks, not in a separate wiki.</li>
      <li><strong>AI Agent Tracking</strong> — See what your agents are doing, how much they cost, and assign them tasks — something Slack and Notion simply can't do.</li>
      <li><strong>Calendar View</strong> — Deadlines, time entries, and agent schedules in one visual timeline.</li>
    </ul>

    <h2>Cost Comparison</h2>
    <div className="not-prose my-6 rounded-xl border border-border/40 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/40 bg-[hsl(var(--marketing-surface-alt))]">
            <th className="text-left p-3 text-[hsl(var(--marketing-text))]">Tool</th>
            <th className="text-right p-3 text-[hsl(var(--marketing-text))]">Per user/month</th>
          </tr>
        </thead>
        <tbody className="text-[hsl(var(--marketing-text-muted))]">
          <tr className="border-b border-border/20"><td className="p-3">Slack Pro</td><td className="text-right p-3">$8.75</td></tr>
          <tr className="border-b border-border/20"><td className="p-3">Notion Plus</td><td className="text-right p-3">$10.00</td></tr>
          <tr className="border-b border-border/20"><td className="p-3">Combined</td><td className="text-right p-3 font-semibold text-[hsl(var(--marketing-text))]">$18.75</td></tr>
          <tr><td className="p-3 font-semibold text-[hsl(var(--marketing-accent))]">Agntive.ai</td><td className="text-right p-3 font-bold text-[hsl(var(--marketing-accent))]">$12.00</td></tr>
        </tbody>
      </table>
    </div>

    <h2>Ready to Simplify?</h2>
    <div className="not-prose mt-6">
      <Button asChild className="bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] to-[hsl(var(--marketing-gradient-end))] text-white border-0">
        <Link to="/auth">Start Your 14-Day Free Trial</Link>
      </Button>
    </div>
  </StaticPageLayout>
);

export default ReplaceSlackNotion;
