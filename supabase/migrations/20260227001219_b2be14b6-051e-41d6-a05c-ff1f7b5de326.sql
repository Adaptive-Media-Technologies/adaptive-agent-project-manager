
-- Add Lenka to 40Ventures team and clean up duplicate pending invites
INSERT INTO public.team_members (team_id, user_id, role)
VALUES ('adf2fa35-9e5c-4229-b2aa-53377f10f6b6', '34a593d3-3f9c-4242-8100-e9ce62ff5b83', 'member')
ON CONFLICT DO NOTHING;

-- Mark all pending invites as accepted
UPDATE public.team_invites
SET status = 'accepted'
WHERE team_id = 'adf2fa35-9e5c-4229-b2aa-53377f10f6b6'
  AND lower(email) = 'lenka@borntobealive.ai'
  AND status = 'pending';
