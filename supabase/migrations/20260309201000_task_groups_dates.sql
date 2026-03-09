-- Optional Task Group dates (timeline planning)
ALTER TABLE public.task_groups
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS end_date date;

