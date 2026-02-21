import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TagFilterProps {
  tags: string[];
  activeTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

const TagFilter = ({ tags, activeTag, onTagSelect }: TagFilterProps) => (
  <div className="flex flex-wrap gap-2">
    <button
      onClick={() => onTagSelect(null)}
      className={cn(
        'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
        !activeTag
          ? 'bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] to-[hsl(var(--marketing-gradient-end))] text-white shadow-md'
          : 'bg-[hsl(var(--marketing-surface-alt))] text-[hsl(var(--marketing-text-muted))] hover:text-[hsl(var(--marketing-text))]'
      )}
    >
      All
    </button>
    {tags.map(tag => (
      <button
        key={tag}
        onClick={() => onTagSelect(activeTag === tag ? null : tag)}
        className={cn(
          'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
          activeTag === tag
            ? 'bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] to-[hsl(var(--marketing-gradient-end))] text-white shadow-md'
            : 'bg-[hsl(var(--marketing-surface-alt))] text-[hsl(var(--marketing-text-muted))] hover:text-[hsl(var(--marketing-text))]'
        )}
      >
        {tag}
      </button>
    ))}
  </div>
);

export default TagFilter;
