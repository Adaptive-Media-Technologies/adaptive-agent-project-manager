import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  meta_description: string;
  tldr: string;
  content: string;
  cover_image_url: string | null;
  author: string;
  published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

export const useBlogPosts = (tag?: string) => {
  return useQuery({
    queryKey: ['blog-posts', tag],
    queryFn: async (): Promise<BlogPost[]> => {
      let postIds: string[] | null = null;

      if (tag) {
        const { data: tagRows } = await supabase
          .from('blog_tags')
          .select('post_id')
          .eq('tag', tag);
        postIds = tagRows?.map(r => r.post_id) ?? [];
        if (postIds.length === 0) return [];
      }

      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (postIds) {
        query = query.in('id', postIds);
      }

      const { data: posts, error } = await query;
      if (error) throw error;

      // Fetch all tags for returned posts
      const ids = posts?.map(p => p.id) ?? [];
      if (ids.length === 0) return [];

      const { data: allTags } = await supabase
        .from('blog_tags')
        .select('post_id, tag')
        .in('post_id', ids);

      const tagMap = new Map<string, string[]>();
      allTags?.forEach(t => {
        const arr = tagMap.get(t.post_id) ?? [];
        arr.push(t.tag);
        tagMap.set(t.post_id, arr);
      });

      return (posts ?? []).map(p => ({
        ...p,
        tags: tagMap.get(p.id) ?? [],
      }));
    },
  });
};

export const useBlogPost = (slug: string) => {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async (): Promise<BlogPost | null> => {
      const { data: post, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (error) throw error;
      if (!post) return null;

      const { data: tags } = await supabase
        .from('blog_tags')
        .select('tag')
        .eq('post_id', post.id);

      return { ...post, tags: tags?.map(t => t.tag) ?? [] };
    },
    enabled: !!slug,
  });
};

export const useBlogTags = () => {
  return useQuery({
    queryKey: ['blog-tags'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('blog_tags')
        .select('tag');
      if (error) throw error;
      const unique = [...new Set(data?.map(t => t.tag) ?? [])];
      return unique.sort();
    },
  });
};
