
-- 1. Create project_messages table
CREATE TABLE public.project_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL DEFAULT '',
  gif_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Create message_attachments table
CREATE TABLE public.message_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid NOT NULL REFERENCES public.project_messages(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  content_type text,
  uploaded_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies for project_messages
CREATE POLICY "Members can view project messages"
  ON public.project_messages FOR SELECT
  USING (public.is_project_member(auth.uid(), project_id));

CREATE POLICY "Members can send project messages"
  ON public.project_messages FOR INSERT
  WITH CHECK (user_id = auth.uid() AND public.is_project_member(auth.uid(), project_id));

CREATE POLICY "Users can delete own messages"
  ON public.project_messages FOR DELETE
  USING (user_id = auth.uid());

-- 5. RLS policies for message_attachments
CREATE POLICY "Members can view message attachments"
  ON public.message_attachments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.project_messages pm
    WHERE pm.id = message_attachments.message_id
      AND public.is_project_member(auth.uid(), pm.project_id)
  ));

CREATE POLICY "Members can upload message attachments"
  ON public.message_attachments FOR INSERT
  WITH CHECK (uploaded_by = auth.uid() AND EXISTS (
    SELECT 1 FROM public.project_messages pm
    WHERE pm.id = message_attachments.message_id
      AND public.is_project_member(auth.uid(), pm.project_id)
  ));

CREATE POLICY "Users can delete own attachments"
  ON public.message_attachments FOR DELETE
  USING (uploaded_by = auth.uid());

-- 6. Create chat-attachments storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-attachments', 'chat-attachments', true);

-- 7. Storage RLS policies
CREATE POLICY "Authenticated users can upload chat attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'chat-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view chat attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-attachments');

CREATE POLICY "Users can delete own chat attachments"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'chat-attachments' AND auth.role() = 'authenticated');

-- 8. Enable Realtime on project_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_messages;

-- 9. Indexes for performance
CREATE INDEX idx_project_messages_project_id ON public.project_messages(project_id, created_at);
CREATE INDEX idx_message_attachments_message_id ON public.message_attachments(message_id);
