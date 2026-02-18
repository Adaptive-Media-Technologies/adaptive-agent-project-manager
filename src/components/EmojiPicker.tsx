import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Smile } from 'lucide-react';
import { useState } from 'react';

const EMOJI_CATEGORIES = [
  { name: 'Smileys', emojis: ['😀','😂','🥹','😊','😍','🥰','😘','😎','🤩','🥳','😏','😢','😭','😤','🤯','🫡','🤔','🫢','🤫','😴'] },
  { name: 'Hands', emojis: ['👍','👎','👏','🙌','🤝','✌️','🤞','💪','👋','🫶'] },
  { name: 'Hearts', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','❤️‍🔥'] },
  { name: 'Objects', emojis: ['🔥','⭐','✨','💡','🎉','🎊','🚀','💯','⚡','🏆'] },
  { name: 'Arrows', emojis: ['✅','❌','⚠️','❓','💬','📌','📎','🔗','📝','🗓️'] },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

const EmojiPicker = ({ onSelect }: EmojiPickerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Emoji">
          <Smile size={18} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start" side="top">
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {EMOJI_CATEGORIES.map(cat => (
            <div key={cat.name}>
              <p className="text-[10px] font-semibold uppercase text-muted-foreground px-1 mb-1">{cat.name}</p>
              <div className="flex flex-wrap gap-0.5">
                {cat.emojis.map(e => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => { onSelect(e); setOpen(false); }}
                    className="h-8 w-8 flex items-center justify-center rounded hover:bg-accent text-lg transition-colors"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
