import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { BlogPost } from '@/hooks/useBlogPosts';
import { getCoverImage } from './coverImages';

const BlogCard = ({ post }: { post: BlogPost }) => {
  const coverSrc = getCoverImage(post.slug);

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col rounded-xl border border-border/40 bg-[hsl(var(--marketing-surface))] overflow-hidden hover:shadow-xl hover:shadow-[hsl(var(--marketing-accent))/0.1] transition-all duration-300 hover:-translate-y-1"
    >
      {/* Cover */}
      <div className="h-44 w-full overflow-hidden">
        {coverSrc ? (
          <img src={coverSrc} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--marketing-gradient-start))] to-[hsl(var(--marketing-gradient-end))] flex items-center justify-center">
            <span className="text-white/80 text-4xl font-bold select-none">{post.title.charAt(0)}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex flex-wrap gap-1.5">
          {post.tags?.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs font-normal">
              {tag}
            </Badge>
          ))}
        </div>
        <h2 className="text-lg font-semibold text-[hsl(var(--marketing-text))] leading-snug group-hover:text-[hsl(var(--marketing-accent))] transition-colors line-clamp-2">
          {post.title}
        </h2>
        <p className="text-sm text-[hsl(var(--marketing-text-muted))] line-clamp-2 flex-1">
          {post.tldr}
        </p>
        <div className="text-xs text-[hsl(var(--marketing-text-muted))] mt-auto pt-2 border-t border-border/30">
          <time dateTime={post.published_at}>
            {format(new Date(post.published_at), 'MMM d, yyyy')}
          </time>
          <span className="mx-2">·</span>
          <span>{post.author}</span>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
