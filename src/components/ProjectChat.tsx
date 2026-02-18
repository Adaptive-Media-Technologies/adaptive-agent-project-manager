import { useState, useRef } from 'react';
import { useProjectChat, ChatMessage } from '@/hooks/useProjectChat';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import EmojiPicker from '@/components/EmojiPicker';
import GifPicker from '@/components/GifPicker';
import { Send, Paperclip, X, Download, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ProjectChatProps {
  projectId: string;
}

const ProjectChat = ({ projectId }: ProjectChatProps) => {
  const { user } = useAuth();
  const { messages, loading, sendMessage, deleteMessage, getAttachmentUrl, scrollRef } = useProjectChat(projectId);
  const [text, setText] = useState('');
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!text.trim() && !gifUrl && files.length === 0) return;
    setSending(true);
    try {
      await sendMessage(text.trim(), gifUrl || undefined, files.length > 0 ? files : undefined);
      setText('');
      setGifUrl(null);
      setFiles([]);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const addFiles = (fileList: FileList) => {
    setFiles(prev => [...prev, ...Array.from(fileList)]);
  };

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const isImage = (type: string | null) => type?.startsWith('image/');

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  if (loading) return <div className="flex flex-1 items-center justify-center"><p className="text-sm text-muted-foreground">Loading chat...</p></div>;

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Messages */}
      <ScrollArea className="flex-1 px-4 md:px-6" ref={scrollRef as any}>
        <div className="py-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-12">No messages yet. Start the conversation!</p>
          )}
          {messages.map(msg => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isOwn={msg.user_id === user?.id}
              onDelete={() => deleteMessage(msg.id)}
              getAttachmentUrl={getAttachmentUrl}
              isImage={isImage}
              formatSize={formatSize}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Attachment preview strip */}
      {(files.length > 0 || gifUrl) && (
        <div className="border-t border-border bg-card px-4 md:px-6 py-2 flex flex-wrap gap-2 items-center">
          {gifUrl && (
            <div className="relative">
              <img src={gifUrl} alt="GIF" className="h-16 rounded border border-border" />
              <button onClick={() => setGifUrl(null)} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"><X size={12} /></button>
            </div>
          )}
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 rounded bg-accent px-2 py-1 text-xs">
              <FileText size={12} className="text-muted-foreground shrink-0" />
              <span className="truncate max-w-[120px]">{f.name}</span>
              <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive"><X size={12} /></button>
            </div>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="border-t border-border bg-card px-4 md:px-6 py-3">
        <div className="flex items-center gap-1">
          <EmojiPicker onSelect={emoji => { setText(prev => prev + emoji); inputRef.current?.focus(); }} />
          <GifPicker onSelect={url => setGifUrl(url)} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Attach files"
          >
            <Paperclip size={18} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
          />
          <Input
            ref={inputRef}
            placeholder="Type a message..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-sm flex-1"
            disabled={sending}
          />
          <Button size="icon" variant="ghost" onClick={handleSend} disabled={sending || (!text.trim() && !gifUrl && files.length === 0)}>
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({
  msg, isOwn, onDelete, getAttachmentUrl, isImage, formatSize,
}: {
  msg: ChatMessage;
  isOwn: boolean;
  onDelete: () => void;
  getAttachmentUrl: (path: string) => string;
  isImage: (type: string | null) => boolean | undefined;
  formatSize: (bytes: number | null) => string;
}) => {
  const initials = msg.profile?.display_name
    ? msg.profile.display_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="group flex gap-2.5">
      <Avatar className="h-8 w-8 mt-0.5 shrink-0">
        {msg.profile?.avatar_url && <AvatarImage src={msg.profile.avatar_url} />}
        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-foreground">{msg.profile?.display_name || 'User'}</span>
          <span className="text-[10px] text-muted-foreground">{format(new Date(msg.created_at), 'h:mm a')}</span>
          {isOwn && (
            <button
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity ml-auto"
              title="Delete message"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
        {msg.content && <p className="text-sm text-foreground whitespace-pre-wrap break-words">{msg.content}</p>}

        {/* Attachments */}
        {msg.attachments && msg.attachments.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-2">
            {msg.attachments.map(att => {
              const url = getAttachmentUrl(att.file_path);
              if (isImage(att.content_type)) {
                return (
                  <a key={att.id} href={url} target="_blank" rel="noopener noreferrer" className="block">
                    <img src={url} alt={att.file_name} className="max-h-40 max-w-[240px] rounded border border-border object-cover" loading="lazy" />
                  </a>
                );
              }
              return (
                <a
                  key={att.id}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded bg-accent px-2.5 py-1.5 text-xs hover:bg-accent/80 transition-colors"
                >
                  <FileText size={14} className="text-muted-foreground shrink-0" />
                  <span className="truncate max-w-[140px]">{att.file_name}</span>
                  {att.file_size && <span className="text-muted-foreground">{formatSize(att.file_size)}</span>}
                  <Download size={12} className="text-muted-foreground" />
                </a>
              );
            })}
          </div>
        )}

        {/* GIF */}
        {msg.gif_url && (
          <img src={msg.gif_url} alt="GIF" className="mt-1.5 max-h-48 rounded border border-border" loading="lazy" />
        )}
      </div>
    </div>
  );
};

export default ProjectChat;
