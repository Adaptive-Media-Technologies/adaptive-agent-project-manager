ALTER TABLE public.tasks
  ADD COLUMN assigned_to uuid,
  ADD COLUMN assigned_type text;