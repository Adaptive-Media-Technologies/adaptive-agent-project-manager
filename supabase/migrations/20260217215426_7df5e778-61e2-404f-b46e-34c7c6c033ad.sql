
-- Allow users to update their own time entries
CREATE POLICY "Users can update own time entries"
ON public.time_entries
FOR UPDATE
USING (user_id = auth.uid());

-- Allow users to delete their own time entries
CREATE POLICY "Users can delete own time entries"
ON public.time_entries
FOR DELETE
USING (user_id = auth.uid());
