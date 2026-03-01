import { useState } from 'react';
import { z } from 'zod';
import emailjs from '@emailjs/browser';
import StaticPageLayout from '@/components/landing/StaticPageLayout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  subject: z.string().trim().min(1, 'Subject is required').max(200),
  message: z.string().trim().min(1, 'Message is required').max(2000),
});

type ContactForm = z.infer<typeof contactSchema>;

const Contact = () => {
  const [form, setForm] = useState<ContactForm>({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [sending, setSending] = useState(false);

  const handleChange = (field: keyof ContactForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as keyof ContactForm;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSending(true);
    try {
      await emailjs.send(
        'service_9a115xi',
        'template_contact',
        {
          from_name: result.data.name,
          from_email: result.data.email,
          subject: result.data.subject,
          message: result.data.message,
        },
        'kZ9ndq6f7Nm0uSfDz'
      );
      toast.success('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try emailing us directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <StaticPageLayout title="Contact Us" metaDescription="Get in touch with the Agntive.ai team for support, partnerships, or press inquiries.">
      <p className="text-xl leading-relaxed mb-8">
        We'd love to hear from you. Whether you have a question about features, pricing, partnerships, or anything else — our team is ready to help.
      </p>

      <form onSubmit={handleSubmit} className="not-prose space-y-5 max-w-lg">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[hsl(var(--marketing-text))] mb-1.5">Name</label>
          <Input
            id="name"
            placeholder="Your name"
            value={form.name}
            onChange={e => handleChange('name', e.target.value)}
            className="bg-[hsl(var(--marketing-surface-alt))] border-border/40 text-[hsl(var(--marketing-text))] placeholder:text-[hsl(var(--marketing-text-muted))]"
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[hsl(var(--marketing-text))] mb-1.5">Email</label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={e => handleChange('email', e.target.value)}
            className="bg-[hsl(var(--marketing-surface-alt))] border-border/40 text-[hsl(var(--marketing-text))] placeholder:text-[hsl(var(--marketing-text-muted))]"
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-[hsl(var(--marketing-text))] mb-1.5">Subject</label>
          <Input
            id="subject"
            placeholder="What's this about?"
            value={form.subject}
            onChange={e => handleChange('subject', e.target.value)}
            className="bg-[hsl(var(--marketing-surface-alt))] border-border/40 text-[hsl(var(--marketing-text))] placeholder:text-[hsl(var(--marketing-text-muted))]"
          />
          {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-[hsl(var(--marketing-text))] mb-1.5">Message</label>
          <Textarea
            id="message"
            placeholder="Tell us how we can help..."
            rows={5}
            value={form.message}
            onChange={e => handleChange('message', e.target.value)}
            className="bg-[hsl(var(--marketing-surface-alt))] border-border/40 text-[hsl(var(--marketing-text))] placeholder:text-[hsl(var(--marketing-text-muted))] resize-none"
          />
          {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
        </div>

        <Button type="submit" disabled={sending} className="w-full sm:w-auto">
          {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          {sending ? 'Sending...' : 'Send Message'}
        </Button>
      </form>

      <div className="mt-12">
        <h2>Prefer Email?</h2>
        <p>
          Reach us directly at <a href="mailto:hello@agntive.ai">hello@agntive.ai</a>.
        </p>

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
      </div>
    </StaticPageLayout>
  );
};

export default Contact;
