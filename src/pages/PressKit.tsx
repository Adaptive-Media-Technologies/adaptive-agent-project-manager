import StaticPageLayout from '@/components/landing/StaticPageLayout';
import agntfindLogo from '@/assets/agntfind-logo.png';

const PressKit = () => (
  <StaticPageLayout title="Press Kit" metaDescription="Download Agntive.ai brand assets, logos, and company information for press and media use.">
    <p className="text-xl leading-relaxed mb-8">
      Everything you need to feature Agntive.ai in your publication. Please follow our brand guidelines when using these assets.
    </p>

    <h2>Company Overview</h2>
    <p>
      <strong>Agntive.ai</strong> is a task-driven workspace that unifies messaging, task management, and AI agent orchestration for small-to-medium teams. Founded in 2025, Agntive replaces fragmented tools like Slack, Trello, and Notion with a single platform where humans and AI agents collaborate as equals.
    </p>

    <h2>Key Facts</h2>
    <ul>
      <li><strong>Founded:</strong> 2025</li>
      <li><strong>Headquarters:</strong> San Francisco, CA (remote-first)</li>
      <li><strong>Category:</strong> AI-Native Collaboration / Project Management</li>
      <li><strong>Key Integration:</strong> OpenClaw — open standard for AI agent interoperability</li>
    </ul>

    <h2>Logo</h2>
    <div className="not-prose my-6 flex gap-6 flex-wrap">
      <div className="rounded-xl border border-border/40 p-8 bg-[hsl(var(--marketing-surface-alt))] flex items-center justify-center">
        <img src={agntfindLogo} alt="Agntive logo" className="h-16 w-16 rounded-xl" />
      </div>
      <div className="rounded-xl border border-border/40 p-8 bg-white flex items-center justify-center">
        <img src={agntfindLogo} alt="Agntive logo on light" className="h-16 w-16 rounded-xl" />
      </div>
    </div>

    <h2>Brand Guidelines</h2>
    <ul>
      <li>Always use the official logo — do not stretch, rotate, or recolor it.</li>
      <li>Maintain adequate spacing around the logo (at least the height of the icon).</li>
      <li>Use "Agntive.ai" or "Agntive" in text — never "AgntFind" or "AGNTIVE".</li>
    </ul>

    <h2>Media Contact</h2>
    <p>
      For press inquiries, interviews, or additional assets, contact <a href="mailto:press@agntive.ai">press@agntive.ai</a>.
    </p>
  </StaticPageLayout>
);

export default PressKit;
