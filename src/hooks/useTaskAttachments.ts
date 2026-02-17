import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type TaskAttachment = {
  id: string;
  task_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  content_type: string | null;
  uploaded_by: string;
  created_at: string;
};

export const useTaskAttachments = (taskId: string | null) => {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchAttachments = useCallback(async () => {
    if (!taskId) { setAttachments([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from('task_attachments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });
    if (error) console.error('[useTaskAttachments] fetch error:', error);
    setAttachments((data as TaskAttachment[]) || []);
    setLoading(false);
  }, [taskId]);

  useEffect(() => { fetchAttachments(); }, [fetchAttachments]);

  const uploadFiles = async (files: FileList) => {
    if (!taskId || !user) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop();
        const path = `${taskId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('task-attachments')
          .upload(path, file, { contentType: file.type });
        if (uploadError) throw uploadError;

        const { error: insertError } = await supabase
          .from('task_attachments')
          .insert({
            task_id: taskId,
            file_name: file.name,
            file_path: path,
            file_size: file.size,
            content_type: file.type,
            uploaded_by: user.id,
          });
        if (insertError) throw insertError;
      }
      await fetchAttachments();
    } finally {
      setUploading(false);
    }
  };

  const deleteAttachment = async (attachment: TaskAttachment) => {
    await supabase.storage.from('task-attachments').remove([attachment.file_path]);
    await supabase.from('task_attachments').delete().eq('id', attachment.id);
    setAttachments(prev => prev.filter(a => a.id !== attachment.id));
  };

  const getPublicUrl = (filePath: string) => {
    const { data } = supabase.storage.from('task-attachments').getPublicUrl(filePath);
    return data.publicUrl;
  };

  return { attachments, loading, uploading, uploadFiles, deleteAttachment, getPublicUrl, refresh: fetchAttachments };
};
