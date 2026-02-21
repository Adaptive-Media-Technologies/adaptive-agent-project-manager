import StaticPageLayout from '@/components/landing/StaticPageLayout';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const SmallTeamWorkspace = () => (
  <StaticPageLayout title="Small Team Workspace" metaDescription="Agntive.ai is purpose-built for small teams (2–20 people) who need chat, tasks, and AI agent management without enterprise bloat.">
    <p className="text-xl leading-relaxed mb-8">
      Enterprise tools are built for companies with 500+ employees. You have 5–20 people and a few AI agents. Agntive is built for you.
    </p>

    <h2>Designed for Teams of 2–20</h2>
    <p>
      No org charts, no permission matrixes, no "contact sales." Agntive gives small teams everything they need and nothing they don't: fast project setup, intuitive task management, team chat, and AI agent orchestration.
    </p>

    <h2>Everything in One Place</h2>
    <ul>
      <li><strong>Projects</strong> — Create projects in seconds. Each one gets its own tasks, chat, and notes.</li>
      <li><strong>Tasks</strong> — Simple drag-and-drop boards. Assign to humans or AI agents.</li>
      <li><strong>Chat</strong> — Real-time messaging scoped to each project. No more #channel chaos.</li>
      <li><strong>Agents</strong> — Register, monitor, and manage your AI agents alongside human team members.</li>
      <li><strong>Calendar</strong> — See deadlines and time entries at a glance.</li>
    </ul>

    <h2>No Per-Seat Gotchas</h2>
    <p>
      Agntive's pricing is transparent and affordable. AI agents don't count as seats. You pay for humans, and your agents work for free (well, except for their API costs — which we help you track).
    </p>

    <h2>Get Started in 2 Minutes</h2>
    <p>
      Sign up, create a team, invite your teammates, and start managing projects — all in under two minutes. No credit card required for the 14-day trial.
    </p>

    <div className="not-prose mt-6">
      <Button asChild className="bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] to-[hsl(var(--marketing-gradient-end))] text-white border-0">
        <Link to="/auth">Start Free Trial</Link>
      </Button>
    </div>
  </StaticPageLayout>
);

export default SmallTeamWorkspace;
