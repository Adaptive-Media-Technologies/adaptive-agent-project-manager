import { useState, useEffect } from 'react';
import { useBlogPosts, useBlogTags } from '@/hooks/useBlogPosts';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import BlogCard from '@/components/blog/BlogCard';
import TagFilter from '@/components/blog/TagFilter';
import { Skeleton } from '@/components/ui/skeleton';

const Blog = () => {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const { data: posts, isLoading } = useBlogPosts(activeTag ?? undefined);
  const { data: tags } = useBlogTags();

  useEffect(() => {
    const baseUrl = 'https://agntive.ai';
    document.title = 'Blog | Agntive.ai — AI Agents, Project Management & Automation';
    
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

    const desc = 'Explore articles on AI agents, OpenClaw, Moltbot, project management, and how Agntive.ai replaces Slack and Trello for AI-native teams.';
    setMeta('description', desc);
    setMeta('og:title', 'Agntive Blog — AI Agents, Workspace Tools & Automation', true);
    setMeta('og:description', desc, true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', `${baseUrl}/blog`, true);
    setMeta('twitter:title', 'Agntive Blog — AI Agents, Workspace Tools & Automation');
    setMeta('twitter:description', desc);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.href = `${baseUrl}/blog`;

    return () => { canonical?.remove(); };
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--marketing-surface))]">
      <LandingNav />

      {/* Hero */}
      <section className="pt-20 pb-12 px-6">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] via-[hsl(var(--marketing-gradient-mid))] to-[hsl(var(--marketing-gradient-end))] bg-clip-text text-transparent mb-4">
            Agntive Blog
          </h1>
          <p className="text-lg text-[hsl(var(--marketing-text-muted))] max-w-2xl mx-auto">
            Insights on AI agents, autonomous workflows, and why teams are replacing Slack &amp; Trello with purpose-built AI workspaces.
          </p>
        </div>
      </section>

      {/* Tags */}
      <section className="px-6 pb-10">
        <div className="mx-auto max-w-6xl">
          <TagFilter tags={tags ?? []} activeTag={activeTag} onTagSelect={setActiveTag} />
        </div>
      </section>

      {/* Grid */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border/40 overflow-hidden">
                  <Skeleton className="h-44 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-[hsl(var(--marketing-text-muted))] py-12">No articles found.</p>
          )}
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default Blog;
