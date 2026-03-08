import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import agntfindLogo from '@/assets/agntfind-logo.png';

const Auth = () => {
  const { user, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isForgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?reset=true`,
        });
        if (error) throw error;
        toast.success('Check your email for a password reset link!');
        setIsForgot(false);
      } else if (isSignUp) {
        if (!username.trim()) { toast.error('Username is required'); return; }
        const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
        if (cleanUsername.length < 3) { toast.error('Username must be at least 3 characters'); return; }
        // Check uniqueness
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .ilike('username', cleanUsername)
          .limit(1);
        if (existing && existing.length > 0) { toast.error('Username already taken'); return; }

        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { display_name: displayName, username: cleanUsername } }
        });
        if (error) throw error;

        // Set username on profile after signup
        if (data.user) {
          await supabase.from('profiles').update({ username: cleanUsername }).eq('id', data.user.id);
        }

        if (data.session) {
          toast.success('Account created! Redirecting...');
        } else {
          toast.success('Account created! Check your email to confirm, then sign in.');
          setIsSignUp(false);
        }
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-3">
          <img
            src={agntfindLogo}
            alt="Agntive logo"
            className="mx-auto h-12 w-12 rounded-2xl shadow-lg shadow-[hsl(var(--marketing-accent))/0.18]"
          />
          <p className="text-center text-sm text-muted-foreground">
            Log in or sign up to start managing project workspaces, tasks, notes and AI Agents.
          </p>
          <CardTitle className="text-center text-2xl">
            {isForgot ? 'Reset Password' : isSignUp ? 'Create Account' : 'Sign In'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center gap-2 mb-4"
            onClick={async () => {
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin },
              });
              if (error) toast.error(error.message);
            }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && !isForgot && (
              <Input placeholder="Display name" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
            )}
            {isSignUp && !isForgot && (
              <div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                  <Input
                    placeholder="username"
                    value={username}
                    onChange={e => {
                      const v = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                      setUsername(v);
                      setUsernameError(v.length > 0 && v.length < 3 ? 'Min 3 characters' : '');
                    }}
                    className="pl-7"
                    required
                    minLength={3}
                    maxLength={30}
                  />
                </div>
                {usernameError && <p className="text-xs text-destructive mt-1">{usernameError}</p>}
              </div>
            )}
            <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            {!isForgot && (
              <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            )}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? '...' : isForgot ? 'Send Reset Link' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>
          {!isSignUp && !isForgot && (
            <button onClick={() => setIsForgot(true)} className="mt-2 w-full text-center text-sm text-muted-foreground hover:text-foreground">
              Forgot password?
            </button>
          )}
          <button
            onClick={() => { setIsForgot(false); setIsSignUp(!isSignUp); }}
            className="mt-2 w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            {isForgot ? 'Back to sign in' : isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
