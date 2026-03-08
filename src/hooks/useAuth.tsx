import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

const requestStoragePersistence = async () => {
  try {
    if (typeof navigator === 'undefined') return;
    // Best-effort: helps some browsers (notably iOS) keep storage between idle/tab discards.
    if ('storage' in navigator && typeof navigator.storage?.persist === 'function') {
      await navigator.storage.persist();
    }
  } catch {
    // Ignore — persistence requests are opportunistic.
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] event:', event);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === 'TOKEN_REFRESHED' && !session) {
        console.warn('[Auth] Token refresh returned no session');
      }

      if (event === 'TOKEN_REFRESH_FAILED') {
        console.warn('[Auth] Token refresh failed; attempting recovery refresh');
        (async () => {
          const { error } = await supabase.auth.refreshSession();
          if (error) console.error('[Auth] Recovery refresh failed:', error.message);
        })();
      }

      if (session) {
        requestStoragePersistence();
      }
    });
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('[Auth] getSession error:', error.message);
      }

      // If a session exists but is near expiry, proactively refresh on startup.
      if (session?.expires_at && session.expires_at * 1000 - Date.now() < 5 * 60 * 1000) {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) console.error('[Auth] startup refresh failed:', refreshError.message);
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session) {
        requestStoragePersistence();
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // On iOS Safari, aggressively refresh session when app returns from background
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const { data: { session: currentSession }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('[Auth] visibility refresh error:', error.message);
            // Session is stale/expired, try to refresh explicitly
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error('[Auth] refresh failed:', refreshError.message);
            }
          } else if (currentSession) {
            // Check if token is close to expiring (within 5 min) and proactively refresh
            const expiresAt = currentSession.expires_at;
            if (expiresAt && expiresAt * 1000 - Date.now() < 5 * 60 * 1000) {
              console.log('[Auth] Token near expiry, proactively refreshing');
              await supabase.auth.refreshSession();
            }
          } else {
            // If storage was cleared (common on iOS tab discard), try a best-effort refresh to recover.
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error('[Auth] refresh recovery failed:', refreshError.message);
            }
          }
        } catch (err) {
          console.error('[Auth] visibility change handler error:', err);
        }
      }
    };

    // Also refresh on focus (some iOS browsers fire focus but not visibilitychange)
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        handleVisibilityChange();
      }
    };

    // pageshow is important for Safari/iOS bfcache restores
    const handlePageShow = (e: PageTransitionEvent) => {
      if (document.visibilityState === 'visible') {
        if (e.persisted) {
          console.log('[Auth] pageshow persisted; re-checking session');
        }
        handleVisibilityChange();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin, data: { display_name: displayName } }
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    requestStoragePersistence();
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
