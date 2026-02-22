-- Add column to track which agent sent a message
ALTER TABLE public.project_messages ADD COLUMN sent_by_agent uuid REFERENCES public.agents(id) ON DELETE SET NULL DEFAULT NULL;