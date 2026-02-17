

# Fix iPhone Safari Session Persistence

## Changes

### 1. `src/integrations/supabase/client.ts`
- Add `detectSessionInUrl: true` to the auth config

### 2. `src/hooks/useAuth.tsx`
- Add a `visibilitychange` event listener that calls `supabase.auth.getSession()` when the user returns to the app, ensuring the token is refreshed after Safari suspends the tab

### 3. Manual Step (You need to do this)
- Go to **Supabase Dashboard > Authentication > Settings**
- Change **JWT Expiry** from 3600 to **86400** (1 day)
- Link: https://supabase.com/dashboard/project/pdzbejpiilgwgqhmbrso/settings/auth

## Why This Works
- The visibility listener catches when a user comes back to Safari after it was backgrounded, and proactively refreshes the session
- Increasing JWT expiry to 1 day means the access token stays valid much longer, so even if the refresh timer was killed by Safari, the token is likely still valid when the user returns

