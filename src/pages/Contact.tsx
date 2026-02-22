import StaticPageLayout from '@/components/landing/StaticPageLayout';

const Contact = () => (
  <StaticPageLayout title="Contact Us" metaDescription="Get in touch with the Agntive.ai team for support, partnerships, or press inquiries.">
    <p className="text-xl leading-relaxed mb-8">
      We'd love to hear from you. Whether you have a question about features, pricing, partnerships, or anything else — our team is ready to help.
    </p>

    <div className="not-prose grid gap-6 sm:grid-cols-2 my-8">
      {[
        { label: 'General Inquiries', email: 'hello@agntive.ai', description: 'Questions about Agntive, features, or getting started.' },
        { label: 'Sales & Enterprise', email: 'hello@agntive.ai', description: 'Custom plans, volume licensing, and enterprise features.' },
        { label: 'Support', email: 'hello@agntive.ai', description: 'Technical help, bug reports, and account issues.' },
        { label: 'Press & Media', email: 'hello@agntive.ai', description: 'Media inquiries, interviews, and press resources.' },
      ].map((item) => (
        <div key={item.label} className="rounded-xl border border-border/40 p-6 bg-[hsl(var(--marketing-surface-alt))]">
          <h3 className="text-lg font-semibold text-[hsl(var(--marketing-text))] mb-2">{item.label}</h3>
          <p className="text-sm text-[hsl(var(--marketing-text-muted))] mb-3">{item.description}</p>
          <a href={`mailto:${item.email}`} className="text-sm font-medium text-[hsl(var(--marketing-accent))] hover:underline">{item.email}</a>
        </div>
      ))}
    </div>

    <h2>Office</h2>
    <p>
      We're a remote-first company with team members across the globe. Our mailing address is:
    </p>
    <p>
      <strong>Agntive, Inc.</strong><br />
      548 Market Street, Suite 36879<br />
      San Francisco, CA 94104<br />
      United States
    </p>
  </StaticPageLayout>
);

export default Contact;
