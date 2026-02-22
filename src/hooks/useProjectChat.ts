import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type ChatAttachment = {
  id: string;
  message_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  content_type: string | null;
  uploaded_by: string;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  gif_url: string | null;
  sent_by_agent: string | null;
  created_at: string;
  profile?: { display_name: string | null; avatar_url: string | null; username: string | null };
  agent?: { display_name: string; email: string | null } | null;
  attachments?: ChatAttachment[];
};

export const useProjectChat = (projectId: string | null, onNewMessage?: (msg: ChatMessage) => void) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 50);
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!projectId) { setMessages([]); setLoading(false); return; }
    setLoading(true);

    const { data: msgs, error } = await (supabase
      .from('project_messages' as any)
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
      .limit(200) as any);

    if (error) { console.error('[chat] fetch error:', error); setLoading(false); return; }

    // Fetch profiles & attachments in parallel
    const userIds: string[] = Array.from(new Set((msgs || []).map((m: any) => String(m.user_id))));
    const msgIds: string[] = (msgs || []).map((m: any) => m.id as string);

    const [profilesRes, attachRes] = await Promise.all([
      userIds.length > 0
        ? supabase.from('profiles').select('id, display_name, avatar_url, username').in('id', userIds)
        : Promise.resolve({ data: [] }),
      msgIds.length > 0
        ? (supabase.from('message_attachments' as any).select('*').in('message_id', msgIds) as any)
        : Promise.resolve({ data: [] }),
    ]);

    // Fetch agent info for agent-sent messages
    const agentIds: string[] = Array.from(new Set((msgs || []).filter((m: any) => m.sent_by_agent).map((m: any) => String(m.sent_by_agent))));
    let agentMap = new Map<string, { display_name: string; email: string | null }>();
    if (agentIds.length > 0) {
      const { data: agentRows } = await (supabase.from('agents' as any).select('id, display_name, email').in('id', agentIds) as any);
      for (const a of (agentRows || []) as any[]) {
        agentMap.set(a.id, { display_name: a.display_name, email: a.email });
      }
    }

    const profileMap = new Map((profilesRes.data || []).map((p: any) => [p.id, p]));
    const attachMap = new Map<string, ChatAttachment[]>();
    for (const a of (attachRes.data || []) as ChatAttachment[]) {
      const existing = attachMap.get(a.message_id) || [];
      existing.push(a);
      attachMap.set(a.message_id, existing);
    }

    const enriched: ChatMessage[] = (msgs || []).map((m: any) => ({
      ...m,
      profile: profileMap.get(m.user_id) || null,
      agent: m.sent_by_agent ? agentMap.get(m.sent_by_agent) || null : null,
      attachments: attachMap.get(m.id) || [],
    }));

    setMessages(enriched);
    setLoading(false);
    scrollToBottom();
  }, [projectId, scrollToBottom]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Realtime subscription
  useEffect(() => {
    if (!projectId) return;
    const channel = supabase
      .channel(`chat-${projectId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'project_messages',
        filter: `project_id=eq.${projectId}`,
      }, async (payload: any) => {
        const msg = payload.new as any;
        // Fetch profile
        const { data: prof } = await supabase.from('profiles').select('id, display_name, avatar_url, username').eq('id', msg.user_id).single();
        // Fetch attachments
        const { data: atts } = await (supabase.from('message_attachments' as any).select('*').eq('message_id', msg.id) as any);
        // Fetch agent info if sent by agent
        let agent = null;
        if (msg.sent_by_agent) {
          const { data: agentRow } = await (supabase.from('agents' as any).select('id, display_name, email').eq('id', msg.sent_by_agent).single() as any);
          if (agentRow) agent = { display_name: agentRow.display_name, email: agentRow.email };
        }
        const enriched: ChatMessage = { ...msg, profile: prof, agent, attachments: atts || [] };
        setMessages(prev => {
          if (prev.some(m => m.id === enriched.id)) return prev;
          return [...prev, enriched];
        });
        scrollToBottom();
        // Notify if message is from another user
        if (user && msg.user_id !== user.id) {
          onNewMessage?.(enriched);
          if (document.hidden && Notification.permission === 'granted') {
            const sender = prof?.display_name || 'Someone';
            const preview = (msg.content || '').slice(0, 80) || (msg.gif_url ? 'sent a GIF' : 'sent an attachment');
            new Notification(sender, { body: preview, icon: '/favicon.png' });
          }
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'project_messages',
        filter: `project_id=eq.${projectId}`,
      }, (payload: any) => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [projectId, scrollToBottom, user, onNewMessage]);

  // Request notification permission once
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const sendMessage = async (content: string, gifUrl?: string, files?: File[]) => {
    if (!projectId || !user) return;

    // Insert the message
    const { data: msg, error } = await (supabase
      .from('project_messages' as any)
      .insert({ project_id: projectId, user_id: user.id, content: content || '', gif_url: gifUrl || null } as any)
      .select()
      .single() as any);

    if (error) throw error;

    // Upload attachments
    if (files && files.length > 0 && msg) {
      for (const file of files) {
        const ext = file.name.split('.').pop();
        const path = `${projectId}/${msg.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('chat-attachments').upload(path, file, { contentType: file.type });
        if (upErr) { console.error('[chat] upload error:', upErr); continue; }
        await (supabase.from('message_attachments' as any).insert({
          message_id: msg.id,
          file_name: file.name,
          file_path: path,
          file_size: file.size,
          content_type: file.type,
          uploaded_by: user.id,
        } as any) as any);
      }
    }
  };

  const deleteMessage = async (messageId: string) => {
    // Delete storage files first
    const msg = messages.find(m => m.id === messageId);
    if (msg?.attachments?.length) {
      const paths = msg.attachments.map(a => a.file_path);
      await supabase.storage.from('chat-attachments').remove(paths);
    }
    await (supabase.from('project_messages' as any).delete().eq('id', messageId) as any);
    setMessages(prev => prev.filter(m => m.id !== messageId));
  };

  const getAttachmentUrl = (filePath: string) => {
    const { data } = supabase.storage.from('chat-attachments').getPublicUrl(filePath);
    return data.publicUrl;
  };

  return { messages, loading, sendMessage, deleteMessage, getAttachmentUrl, scrollRef };
};
