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

      // If token refresh failed, try to recover once
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.warn('[Auth] Token refresh returned no session, clearing state');
      }
    });
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('[Auth] getSession error:', error.message);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
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

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
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
