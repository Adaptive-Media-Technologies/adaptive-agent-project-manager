import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useState, useCallback } from 'react';
import { Image } from 'lucide-react';

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
}

const GIPHY_KEY = 'GlVGYI8yrg0sZMg0GTH8yCqmBal4cT00'; // GIPHY public beta key

const GifPicker = ({ onSelect }: GifPickerProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; url: string; preview: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const endpoint = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(q)}&limit=20&rating=g`;
      const res = await fetch(endpoint);
      const json = await res.json();
      setResults(
        (json.data || []).map((g: any) => ({
          id: g.id,
          url: g.images.original.url,
          preview: g.images.fixed_width_small.url,
        }))
      );
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); search(query); }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="GIF">
          <Image size={18} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start" side="top">
        <Input
          placeholder="Search GIFs..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-sm mb-2"
          autoFocus
        />
        {loading && <p className="text-xs text-muted-foreground text-center py-4">Searching...</p>}
        {!loading && results.length === 0 && query && <p className="text-xs text-muted-foreground text-center py-4">No results</p>}
        <div className="grid grid-cols-3 gap-1 max-h-52 overflow-y-auto">
          {results.map(gif => (
            <button
              key={gif.id}
              type="button"
              onClick={() => { onSelect(gif.url); setOpen(false); setQuery(''); setResults([]); }}
              className="rounded overflow-hidden hover:ring-2 ring-primary transition-all"
            >
              <img src={gif.preview} alt="GIF" className="w-full h-20 object-cover" loading="lazy" />
            </button>
          ))}
        </div>
        {results.length > 0 && (
          <p className="text-[9px] text-muted-foreground text-right mt-1">Powered by GIPHY</p>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default GifPicker;
