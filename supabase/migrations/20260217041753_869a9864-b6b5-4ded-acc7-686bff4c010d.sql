
-- Create storage bucket for task attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('task-attachments', 'task-attachments', true);

-- Storage policies for task-attachments bucket
CREATE POLICY "Authenticated users can upload task attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'task-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view task attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'task-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own task attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'task-attachments' AND auth.role() = 'authenticated');

-- Create task_attachments table
CREATE TABLE public.task_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  content_type TEXT,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments on accessible tasks"
ON public.task_attachments FOR SELECT
USING (EXISTS (
  SELECT 1 FROM tasks t JOIN projects p ON p.id = t.project_id
  WHERE t.id = task_attachments.task_id
  AND (p.owner_id = auth.uid() OR is_project_team_member(p.id, auth.uid()))
));

CREATE POLICY "Users can upload attachments to accessible tasks"
ON public.task_attachments FOR INSERT
WITH CHECK (
  uploaded_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM tasks t JOIN projects p ON p.id = t.project_id
    WHERE t.id = task_attachments.task_id
    AND (p.owner_id = auth.uid() OR is_project_team_member(p.id, auth.uid()))
  )
);

CREATE POLICY "Users can delete own attachments"
ON public.task_attachments FOR DELETE
USING (uploaded_by = auth.uid());
