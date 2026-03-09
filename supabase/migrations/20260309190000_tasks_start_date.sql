-- Add optional start date for timeline bars

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS start_date date;

