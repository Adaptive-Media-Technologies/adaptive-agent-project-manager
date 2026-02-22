import { useState, useRef, useEffect, useCallback } from 'react';
import { useProjectChat, ChatMessage } from '@/hooks/useProjectChat';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import EmojiPicker from '@/components/EmojiPicker';
import { Send, Paperclip, X, Download, Trash2, FileText } from 'lucide-react';
import FormattingToolbar from '@/components/FormattingToolbar';
import { format } from 'date-fns';
import { toast } from 'sonner';
// GifPicker removed — GIPHY public key was rate-limited

interface ProjectChatProps {
  projectId: string;
  onNewMessage?: (msg: ChatMessage) => void;
}

type MemberSuggestion = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

const ProjectChat = ({ projectId, onNewMessage }: ProjectChatProps) => {
  const { user } = useAuth();
  const { messages, loading, sendMessage, deleteMessage, getAttachmentUrl, scrollRef } = useProjectChat(projectId, onNewMessage);
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // @mention state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState(-1);
  const [members, setMembers] = useState<MemberSuggestion[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MemberSuggestion[]>([]);
  const [mentionIndex, setMentionIndex] = useState(0);

  // Fetch team members for this project
  useEffect(() => {
    const fetchMembers = async () => {
      if (!projectId) return;
      // Get project to find team_id
      const { data: project } = await (supabase.from('projects' as any).select('team_id, owner_id').eq('id', projectId).single() as any);
      if (!project) return;

      let userIds: string[] = [project.owner_id];
      if (project.team_id) {
        const { data: teamMembers } = await (supabase.from('team_members' as any).select('user_id').eq('team_id', project.team_id) as any);
        if (teamMembers) userIds = [...new Set([...userIds, ...teamMembers.map((m: any) => m.user_id)])];
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', userIds);
      
      setMembers((profiles || []) as MemberSuggestion[]);
    };
    fetchMembers();
  }, [projectId]);

  // Filter members based on mention query
  useEffect(() => {
    if (mentionQuery === null) {
      setFilteredMembers([]);
      return;
    }
    const q = mentionQuery.toLowerCase();
    const filtered = members.filter(m => {
      if (m.id === user?.id) return false; // don't suggest self
      return (m.username && m.username.toLowerCase().includes(q)) ||
             (m.display_name && m.display_name.toLowerCase().includes(q));
    });
    setFilteredMembers(filtered);
    setMentionIndex(0);
  }, [mentionQuery, members, user?.id]);

  // Helper to get plain text from contentEditable
  const getEditorText = () => {
    const el = editorRef.current;
    if (!el) return '';
    return el.innerText || '';
  };

  // Convert HTML to markdown-ish text for storage
  const htmlToMarkdown = (html: string): string => {
    let md = html;
    md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**');
    md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*');
    md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
    md = md.replace(/<s>(.*?)<\/s>/gi, '~~$1~~');
    md = md.replace(/<strike>(.*?)<\/strike>/gi, '~~$1~~');
    md = md.replace(/<code>(.*?)<\/code>/gi, '`$1`');
    md = md.replace(/<li>(.*?)<\/li>/gi, '- $1');
    md = md.replace(/<\/?[uo]l>/gi, '');
    md = md.replace(/<br\s*\/?>/gi, '\n');
    md = md.replace(/<div>/gi, '\n');
    md = md.replace(/<\/div>/gi, '');
    md = md.replace(/<pre>(.*?)<\/pre>/gi, '`$1`');
    md = md.replace(/<[^>]+>/g, '');
    md = md.replace(/&nbsp;/g, ' ');
    md = md.replace(/&lt;/g, '<');
    md = md.replace(/&gt;/g, '>');
    md = md.replace(/&amp;/g, '&');
    return md.trim();
  };

  const handleEditorInput = () => {
    const plainText = getEditorText();
    setText(plainText);

    // @mention detection
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const textNode = range.startContainer;
    if (textNode.nodeType !== Node.TEXT_NODE) return;
    const textContent = textNode.textContent || '';
    const cursorPos = range.startOffset;
    const beforeCursor = textContent.slice(0, cursorPos);
    const atIdx = beforeCursor.lastIndexOf('@');
    
    if (atIdx >= 0 && (atIdx === 0 || beforeCursor[atIdx - 1] === ' ')) {
      const query = beforeCursor.slice(atIdx + 1);
      if (!query.includes(' ')) {
        setMentionQuery(query);
        setMentionStart(atIdx);
        return;
      }
    }
    setMentionQuery(null);
    setMentionStart(-1);
  };

  const insertMention = (member: MemberSuggestion) => {
    const handle = member.username || member.display_name || 'user';
    const el = editorRef.current;
    if (!el) return;
    
    // For contentEditable, we need to manipulate the DOM
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const textNode = range.startContainer;
      if (textNode.nodeType === Node.TEXT_NODE) {
        const textContent = textNode.textContent || '';
        const cursorPos = range.startOffset;
        const before = textContent.slice(0, mentionStart);
        const after = textContent.slice(cursorPos);
        textNode.textContent = `${before}@${handle} ${after}`;
        // Set cursor after mention
        const newPos = before.length + handle.length + 2;
        range.setStart(textNode, newPos);
        range.setEnd(textNode, newPos);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
    
    setText(getEditorText());
    setMentionQuery(null);
    setMentionStart(-1);
    el.focus();
  };

  const handleSend = async () => {
    const el = editorRef.current;
    const htmlContent = el?.innerHTML || '';
    const content = htmlToMarkdown(htmlContent);
    if (!content.trim() && files.length === 0) return;
    setSending(true);
    try {
      await sendMessage(content.trim(), undefined, files.length > 0 ? files : undefined);

      // Create notifications for @mentions
      if (content && user) {
        const mentionRegex = /@([a-z0-9_]+)/gi;
        let match;
        const mentionedUsernames = new Set<string>();
        while ((match = mentionRegex.exec(content)) !== null) {
          mentionedUsernames.add(match[1].toLowerCase());
        }
        
        for (const uname of mentionedUsernames) {
          const mentioned = members.find(m => m.username?.toLowerCase() === uname);
          if (mentioned && mentioned.id !== user.id) {
            await (supabase.from('notifications' as any).insert({
              user_id: mentioned.id,
              type: 'mention',
              message: content.slice(0, 200),
              project_id: projectId,
              from_user_id: user.id,
            } as any) as any);
          }
        }
      }

      setText('');
      if (el) el.innerHTML = '';
      setFiles([]);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (mentionQuery !== null && filteredMembers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(i => Math.min(i + 1, filteredMembers.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(i => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredMembers[mentionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setMentionQuery(null);
        return;
      }
    }
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
        <div className="py-4 space-y-4">
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
      {files.length > 0 && (
        <div className="border-t border-border bg-card px-4 md:px-6 py-2.5 flex flex-wrap gap-2 items-center">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-xs">
              <FileText size={12} className="text-muted-foreground shrink-0" />
              <span className="truncate max-w-[120px] font-medium">{f.name}</span>
              <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive"><X size={12} /></button>
            </div>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="bg-card px-4 md:px-6 py-3 relative">
        {/* @mention dropdown */}
        {mentionQuery !== null && filteredMembers.length > 0 && (
          <div className="absolute bottom-full left-4 right-4 mb-1 rounded-xl border border-border bg-popover shadow-lg overflow-hidden z-50">
            {filteredMembers.map((m, i) => (
              <button
                key={m.id}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                  i === mentionIndex ? 'bg-accent' : 'hover:bg-accent/50'
                }`}
                onMouseDown={e => { e.preventDefault(); insertMention(m); }}
                onMouseEnter={() => setMentionIndex(i)}
              >
                <Avatar className="h-7 w-7">
                  {m.avatar_url && <AvatarImage src={m.avatar_url} />}
                  <AvatarFallback className="text-[10px]">
                    {m.display_name ? m.display_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-foreground">{m.username || 'no handle'}</span>
                  {m.display_name && <span className="ml-2 text-muted-foreground">{m.display_name}</span>}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
          {/* Toolbar row */}
          <div className="flex items-center gap-0.5 px-2 pt-1.5 pb-0.5 border-b border-border/50">
            <FormattingToolbar editorRef={editorRef} />
            <div className="h-4 w-px bg-border mx-1" />
            <EmojiPicker onSelect={emoji => {
              const el = editorRef.current;
              if (el) {
                el.focus();
                document.execCommand('insertText', false, emoji);
                setText(getEditorText());
              }
            }} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Attach files"
            >
              <Paperclip size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
            />
          </div>
          {/* ContentEditable + send */}
          <div className="flex items-end px-2 pb-1.5">
            <div
              ref={editorRef}
              contentEditable={!sending}
              onInput={handleEditorInput}
              onKeyDown={handleKeyDown}
              data-placeholder="Type a message... Use @ to mention"
              className="text-sm flex-1 border-0 shadow-none focus-visible:ring-0 bg-transparent outline-none py-2 text-foreground resize-none min-h-[96px] max-h-[200px] overflow-y-auto empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none"
            />
            <Button size="icon" variant="ghost" className="rounded-lg h-8 w-8 shrink-0 mb-1" onClick={handleSend} disabled={sending || (!text.trim() && files.length === 0)}>
              <Send size={15} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Parse inline markdown and @mentions
const renderMessageContent = (content: string) => {
  if (!content) return null;

  // Split into lines for list support
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) elements.push(<br key={`br-${lineIdx}`} />);

    // Check for bullet list
    const listMatch = line.match(/^[-*]\s(.+)/);
    const lineContent = listMatch ? listMatch[1] : line;

    const inlineParsed = parseInlineMarkdown(lineContent);

    if (listMatch) {
      elements.push(
        <span key={`li-${lineIdx}`} className="flex items-start gap-1.5">
          <span className="text-muted-foreground select-none mt-px">•</span>
          <span>{inlineParsed}</span>
        </span>
      );
    } else {
      elements.push(<span key={`l-${lineIdx}`}>{inlineParsed}</span>);
    }
  });

  return (
    <p className="text-sm text-foreground whitespace-pre-wrap break-words mt-0.5">
      {elements}
    </p>
  );
};

// Parse bold, italic, strikethrough, code, and @mentions
const parseInlineMarkdown = (text: string): React.ReactNode[] => {
  // Order matters: bold before italic
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|~~(.+?)~~|`(.+?)`|@[a-z0-9_]+)/gi;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const full = match[0];
    if (match[2]) {
      parts.push(<strong key={match.index} className="font-bold">{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={match.index}>{match[3]}</em>);
    } else if (match[4]) {
      parts.push(<s key={match.index} className="text-muted-foreground">{match[4]}</s>);
    } else if (match[5]) {
      parts.push(<code key={match.index} className="rounded bg-muted px-1 py-0.5 text-[13px] font-mono">{match[5]}</code>);
    } else if (/^@[a-z0-9_]+$/i.test(full)) {
      parts.push(
        <span key={match.index} className="rounded px-1 py-0.5 bg-[hsl(var(--chat-mention-bg))] text-[hsl(var(--chat-mention-text))] font-semibold">
          {full}
        </span>
      );
    }
    lastIndex = match.index + full.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
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
  const isAgent = !!msg.agent;
  const displayName = isAgent
    ? msg.agent!.display_name
    : (msg.profile?.username || msg.profile?.display_name || 'User');
  const initials = isAgent
    ? msg.agent!.display_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : msg.profile?.display_name
      ? msg.profile.display_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
      : '?';

  return (
    <div className="group flex gap-3 animate-fade-in-up">
      <Avatar className="h-8 w-8 mt-0.5 shrink-0">
        {msg.profile?.avatar_url && <AvatarImage src={msg.profile.avatar_url} />}
        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
      </Avatar>
      <div className={`flex-1 min-w-0 rounded-xl px-3 py-2 border ${isOwn ? 'bg-[hsl(var(--chat-own-bg))] border-[hsl(var(--chat-own-border))]' : 'bg-[hsl(var(--chat-other-bg))] border-[hsl(var(--chat-other-border))]'}`}>
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-semibold text-foreground">{displayName}</span>
          {isAgent && <span className="text-[10px] font-medium text-purple-400">bot</span>}
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
        {msg.content && renderMessageContent(msg.content)}

        {/* Attachments */}
        {msg.attachments && msg.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {msg.attachments.map(att => {
              const url = getAttachmentUrl(att.file_path);
              if (isImage(att.content_type)) {
                return (
                  <a key={att.id} href={url} target="_blank" rel="noopener noreferrer" className="block">
                    <img src={url} alt={att.file_name} className="max-h-40 max-w-[240px] rounded-lg border border-border object-cover" loading="lazy" />
                  </a>
                );
              }
              return (
                <a
                  key={att.id}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-accent/80 px-3 py-2 text-xs font-medium hover:bg-accent transition-colors"
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
          <img src={msg.gif_url} alt="GIF" className="mt-2 max-h-48 rounded-lg border border-border" loading="lazy" />
        )}
      </div>
    </div>
  );
};

export default ProjectChat;
