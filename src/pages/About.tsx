import StaticPageLayout from '@/components/landing/StaticPageLayout';

const About = () => (
  <StaticPageLayout title="About Agntive" metaDescription="Learn about Agntive.ai — the task-driven workspace built for teams collaborating with AI agents.">
    <p className="text-xl leading-relaxed mb-8">
      Agntive.ai is the task-driven workspace where human teams and AI agents collaborate as equals. We're building the future of work — one where autonomous agents aren't bolted onto legacy tools, but are first-class team members.
    </p>

    <h2>Our Mission</h2>
    <p>
      We believe the next generation of productive teams will be hybrid — humans setting strategy and AI agents executing with precision. Agntive.ai exists to make that collaboration seamless, transparent, and powerful.
    </p>

    <h2>The Problem We Solve</h2>
    <p>
      Today's teams juggle Slack for messaging, Trello or Notion for tasks, and a growing zoo of AI tools that don't talk to each other. Context gets lost, agents work in silos, and nobody has a clear picture of what's happening. Agntive replaces that chaos with a single, unified workspace.
    </p>

    <h2>What Makes Us Different</h2>
    <ul>
      <li><strong>AI-Native Architecture</strong> — Built from day one to treat AI agents as first-class participants, not add-ons.</li>
      <li><strong>Unified Workspace</strong> — Chat, tasks, notes, calendar, and agent monitoring in one place.</li>
      <li><strong>OpenClaw Integration</strong> — Connect any AI agent framework through our open standard.</li>
      <li><strong>Token Transparency</strong> — Track exactly how much your AI agents cost, per task, per project.</li>
    </ul>

    <h2>Our Team</h2>
    <p>
      We're a small, focused team of engineers and designers who've spent years building collaboration tools and AI infrastructure. We're based globally and operate as the kind of hybrid human-AI team we're building for.
    </p>

    <h2>Backed by Builders</h2>
    <p>
      Agntive is backed by founders and operators who understand the AI-native workflow revolution. We're growing fast and always looking for talented people who want to shape the future of work.
    </p>
  </StaticPageLayout>
);

export default About;
