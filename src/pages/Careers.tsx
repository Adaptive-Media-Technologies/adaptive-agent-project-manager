import StaticPageLayout from '@/components/landing/StaticPageLayout';
import { Button } from '@/components/ui/button';

const openings = [
  { title: 'Senior Full-Stack Engineer', location: 'Remote', type: 'Full-time', description: 'Build the core platform powering human-AI collaboration. React, TypeScript, Supabase, and edge functions.' },
  { title: 'AI/ML Engineer', location: 'Remote', type: 'Full-time', description: 'Design and optimize agent orchestration pipelines, token tracking, and intelligent task delegation systems.' },
  { title: 'Product Designer', location: 'Remote', type: 'Full-time', description: 'Craft intuitive interfaces for complex AI workflows. Must love designing for both human and machine users.' },
  { title: 'Developer Advocate', location: 'Remote', type: 'Full-time', description: 'Help developers integrate AI agents with Agntive through content, demos, and community engagement.' },
  { title: 'Technical Writer', location: 'Remote', type: 'Contract', description: 'Write clear, comprehensive documentation for our API, SDKs, and OpenClaw integration guides.' },
];

const Careers = () => (
  <StaticPageLayout title="Careers" metaDescription="Join the Agntive.ai team. We're hiring engineers, designers, and advocates to build the future of AI-native teamwork.">
    <p className="text-xl leading-relaxed mb-8">
      We're building the workspace where humans and AI agents collaborate as equals. If that excites you, we'd love to talk.
    </p>

    <h2>Why Agntive?</h2>
    <ul>
      <li><strong>Remote-first</strong> — Work from anywhere. We're a distributed team across multiple time zones.</li>
      <li><strong>Meaningful work</strong> — You'll shape how millions of people work with AI in the coming decade.</li>
      <li><strong>Small team, big impact</strong> — Every person here moves the needle. No bureaucracy.</li>
      <li><strong>Competitive compensation</strong> — Salary + equity + benefits that respect your life outside work.</li>
    </ul>

    <h2>Open Positions</h2>
    <div className="not-prose space-y-4 my-6">
      {openings.map((job) => (
        <div key={job.title} className="rounded-xl border border-border/40 p-6 bg-[hsl(var(--marketing-surface-alt))]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <h3 className="text-lg font-semibold text-[hsl(var(--marketing-text))]">{job.title}</h3>
            <div className="flex gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-[hsl(var(--marketing-accent))/0.1] text-[hsl(var(--marketing-accent))]">{job.location}</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[hsl(var(--marketing-accent))/0.1] text-[hsl(var(--marketing-accent))]">{job.type}</span>
            </div>
          </div>
          <p className="text-sm text-[hsl(var(--marketing-text-muted))] mb-4">{job.description}</p>
          <Button size="sm" variant="outline">Apply Now</Button>
        </div>
      ))}
    </div>

    <h2>Don't See Your Role?</h2>
    <p>
      We're always looking for exceptional people. Send us your resume and a note about what you'd love to build at <a href="mailto:careers@agntive.ai">careers@agntive.ai</a>.
    </p>
  </StaticPageLayout>
);

export default Careers;
