import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const { user, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  if (user) return <Navigate to="/" replace />;

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
        await signUp(email, password, displayName);
        toast.success('Check your email to confirm your account!');
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
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {isForgot ? 'Reset Password' : isSignUp ? 'Create Account' : 'Sign In'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && !isForgot && (
              <Input placeholder="Display name" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
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
