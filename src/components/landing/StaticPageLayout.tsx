import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import { useEffect } from 'react';

interface StaticPageLayoutProps {
  title: string;
  metaDescription: string;
  children: React.ReactNode;
}

const StaticPageLayout = ({ title, metaDescription, children }: StaticPageLayoutProps) => {
  useEffect(() => {
    document.title = `${title} | Agntive.ai`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', metaDescription);
  }, [title, metaDescription]);

  return (
    <div className="min-h-screen bg-[hsl(var(--marketing-surface))]">
      <LandingNav />
      <main className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-bold text-[hsl(var(--marketing-text))] mb-8">{title}</h1>
        <div className="prose prose-lg dark:prose-invert max-w-none text-[hsl(var(--marketing-text-muted))] [&_h2]:text-[hsl(var(--marketing-text))] [&_h3]:text-[hsl(var(--marketing-text))] [&_strong]:text-[hsl(var(--marketing-text))] [&_a]:text-[hsl(var(--marketing-accent))]">
          {children}
        </div>
      </main>
      <LandingFooter />
    </div>
  );
};

export default StaticPageLayout;
