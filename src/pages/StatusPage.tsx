import StaticPageLayout from '@/components/landing/StaticPageLayout';
import { CheckCircle } from 'lucide-react';

const services = [
  { name: 'Web Application', status: 'Operational' },
  { name: 'API & Edge Functions', status: 'Operational' },
  { name: 'Authentication', status: 'Operational' },
  { name: 'Database', status: 'Operational' },
  { name: 'Real-time Messaging', status: 'Operational' },
  { name: 'File Storage', status: 'Operational' },
  { name: 'OpenClaw Gateway', status: 'Operational' },
  { name: 'Agent Webhooks', status: 'Operational' },
];

const StatusPage = () => (
  <StaticPageLayout title="System Status" metaDescription="Check the current operational status of all Agntive.ai services including API, auth, database, and messaging.">
    <p className="text-xl leading-relaxed mb-8">
      All systems are currently operational. We monitor our infrastructure 24/7 to ensure reliability.
    </p>

    <div className="not-prose my-8 rounded-xl border border-border/40 overflow-hidden">
      <div className="p-4 bg-green-500/10 border-b border-border/40 flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <span className="text-sm font-semibold text-green-500">All Systems Operational</span>
      </div>
      {services.map((svc) => (
        <div key={svc.name} className="flex items-center justify-between px-4 py-3 border-b border-border/20 last:border-0">
          <span className="text-sm text-[hsl(var(--marketing-text))]">{svc.name}</span>
          <span className="text-xs font-medium text-green-500 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            {svc.status}
          </span>
        </div>
      ))}
    </div>

    <h2>Incident History</h2>
    <p>No incidents reported in the last 90 days.</p>

    <h2>Subscribe to Updates</h2>
    <p>
      Get notified about outages and maintenance windows by emailing <a href="mailto:hello@agntive.ai">hello@agntive.ai</a>.
    </p>
  </StaticPageLayout>
);

export default StatusPage;
