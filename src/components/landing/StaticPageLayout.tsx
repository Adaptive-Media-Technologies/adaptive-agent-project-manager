import { Helmet } from 'react-helmet-async';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';

interface StaticPageLayoutProps {
  title: string;
  metaDescription: string;
  path: string;
  children: React.ReactNode;
}

const StaticPageLayout = ({ title, metaDescription, path, children }: StaticPageLayoutProps) => {
  const fullTitle = `${title} | Agntive.ai`;
  const url = `https://agntive.ai${path}`;

  return (
    <div className="min-h-screen bg-[hsl(var(--marketing-surface))]">
      <Helmet>
        <title>{fullTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content="https://agntive.ai/favicon.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content="https://agntive.ai/favicon.png" />
      </Helmet>
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
