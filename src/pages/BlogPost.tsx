import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlogPost } from '@/hooks/useBlogPosts';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { getCoverImage } from '@/components/blog/coverImages';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = useBlogPost(slug ?? '');
  const coverSrc = slug ? getCoverImage(slug) : undefined;

  useEffect(() => {
    if (!post) return;
    const baseUrl = 'https://adaptive-agent-project-manager.lovable.app';
    const postUrl = `${baseUrl}/blog/${slug}`;

    // Title
    document.title = `${post.title} | Agntive Blog`;

    // Meta description
    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', post.meta_description);
    setMeta('author', post.author);

    // Open Graph
    setMeta('og:title', post.title, true);
    setMeta('og:description', post.meta_description, true);
    setMeta('og:type', 'article', true);
    setMeta('og:url', postUrl, true);

    // Twitter
    setMeta('twitter:title', post.title);
    setMeta('twitter:description', post.meta_description);
    setMeta('twitter:card', 'summary_large_image');

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.href = postUrl;

    // JSON-LD BlogPosting
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.meta_description,
      author: { '@type': 'Organization', name: post.author, url: baseUrl },
      datePublished: post.published_at,
      dateModified: post.updated_at,
      publisher: {
        '@type': 'Organization',
        name: 'Agntive.ai',
        url: baseUrl,
        logo: { '@type': 'ImageObject', url: `${baseUrl}/favicon.ico` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
      keywords: post.tags?.join(', '),
    });
    document.head.appendChild(script);

    return () => {
      script.remove();
      canonical?.remove();
    };
  }, [post, slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--marketing-surface))]">
        <LandingNav />
        <div className="mx-auto max-w-3xl px-6 py-20 space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[hsl(var(--marketing-surface))]">
        <LandingNav />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-[hsl(var(--marketing-text))]">Post not found</h1>
          <Link to="/blog" className="text-[hsl(var(--marketing-accent))] hover:underline mt-4 inline-block">
            ← Back to Blog
          </Link>
        </div>
        <LandingFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--marketing-surface))]">
      <LandingNav />

      <article className="mx-auto max-w-3xl px-6 py-12">
        {/* Back */}
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--marketing-text-muted))] hover:text-[hsl(var(--marketing-text))] mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Blog
        </Link>

        {/* Cover */}
        <div className="w-full h-64 md:h-80 rounded-xl mb-8 overflow-hidden">
          {coverSrc ? (
            <img src={coverSrc} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--marketing-gradient-start))] to-[hsl(var(--marketing-gradient-end))] flex items-center justify-center">
              <span className="text-white/60 text-6xl font-bold select-none">{post.title.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags?.map(tag => (
              <Link key={tag} to={`/blog?tag=${encodeURIComponent(tag)}`}>
                <Badge variant="secondary" className="text-xs">{tag}</Badge>
              </Link>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[hsl(var(--marketing-text))] leading-tight mb-3">
            {post.title}
          </h1>
          <div className="text-sm text-[hsl(var(--marketing-text-muted))]">
            <time dateTime={post.published_at}>{format(new Date(post.published_at), 'MMMM d, yyyy')}</time>
            <span className="mx-2">·</span>
            <span>{post.author}</span>
          </div>
        </header>

        {/* TLDR */}
        <div className="rounded-lg border border-[hsl(var(--marketing-accent))/0.3] bg-[hsl(var(--marketing-accent))/0.08] p-5 mb-10">
          <p className="text-sm font-semibold text-[hsl(var(--marketing-accent))] mb-1">TL;DR</p>
          <p className="text-[hsl(var(--marketing-text))] leading-relaxed">{post.tldr}</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none
          prose-headings:text-[hsl(var(--marketing-text))]
          prose-p:text-[hsl(var(--marketing-text-muted))]
          prose-a:text-[hsl(var(--marketing-accent))]
          prose-strong:text-[hsl(var(--marketing-text))]
          prose-li:text-[hsl(var(--marketing-text-muted))]
        ">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
};

export default BlogPost;
