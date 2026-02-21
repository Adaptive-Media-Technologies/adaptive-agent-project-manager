
-- Blog posts table
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  meta_description text NOT NULL DEFAULT '',
  tldr text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  cover_image_url text,
  author text NOT NULL DEFAULT 'Agntive Team',
  published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Blog tags table
CREATE TABLE public.blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag text NOT NULL
);

-- Index for fast tag lookups
CREATE INDEX idx_blog_tags_post_id ON public.blog_tags(post_id);
CREATE INDEX idx_blog_tags_tag ON public.blog_tags(tag);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(published, published_at DESC);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;

-- Public read access (blog is public-facing)
CREATE POLICY "Anyone can read published blog posts"
  ON public.blog_posts FOR SELECT
  USING (published = true);

CREATE POLICY "Anyone can read blog tags"
  ON public.blog_tags FOR SELECT
  USING (true);

-- Authenticated users can manage posts
CREATE POLICY "Authenticated users can insert blog posts"
  ON public.blog_posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update blog posts"
  ON public.blog_posts FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete blog posts"
  ON public.blog_posts FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Authenticated users can manage tags
CREATE POLICY "Authenticated users can insert blog tags"
  ON public.blog_tags FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete blog tags"
  ON public.blog_tags FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Updated_at trigger
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_note_updated_at();
