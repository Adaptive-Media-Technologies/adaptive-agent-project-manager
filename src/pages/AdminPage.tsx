import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Shield, Users, Search, ArrowLeft, LogIn, Clock, UserX } from 'lucide-react';


type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  display_name: string;
  username: string;
  avatar_url: string;
  roles: string[];
  project_count: number;
  task_count: number;
  suspicious?: boolean;
};

type FeedbackRow = {
  id: string;
  email: string | null;
  category: string;
  message: string;
  created_at: string;
};


const safeAvatarUrl = (url?: string) =>
  typeof url === 'string' && url.trim().toLowerCase().startsWith('https://') ? url.trim() : undefined;

const StaffLogin = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5 border rounded-xl p-6 bg-card">
        <div className="flex items-center gap-3">
          <Shield className="text-primary" size={26} />
          <div>
            <h1 className="text-xl font-bold text-foreground">Agntive Admin</h1>
            <p className="text-sm text-muted-foreground">Staff only</p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-email">Email</Label>
          <Input id="admin-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-password">Password</Label>
          <Input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          <LogIn size={16} className="mr-2" />
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
};

const AdminPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);
  const [search, setSearch] = useState('');
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);


  // Check admin role — never redirect away from /admin
  useEffect(() => {
    if (authLoading) return;
    if (!user) { setIsAdmin(false); setRoleChecked(true); return; }

    let cancelled = false;
    const checkAdmin = async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      if (cancelled) return;
      setIsAdmin(!!data);
      setRoleChecked(true);
    };
    checkAdmin();
    return () => { cancelled = true; };
  }, [user, authLoading]);


  // Fetch users
  useEffect(() => {
    if (!isAdmin) return;
    const fetchUsers = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('admin-users', {
        method: 'GET',
      });

      if (error) {
        toast.error('Failed to load users');
        console.error(error);
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    };
    fetchUsers();
  }, [isAdmin]);

  // Fetch feedback
  useEffect(() => {
    if (!isAdmin) return;
    const fetchFeedback = async () => {
      const { data, error } = await supabase
        .from('product_feedback')
        .select('id, email, category, message, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) {
        console.error(error);
      } else {
        setFeedback(data || []);
      }
    };
    fetchFeedback();
  }, [isAdmin]);


  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingRole(userId);
    const { error } = await supabase.functions.invoke('admin-users?action=update-role', {
      method: 'POST',
      body: { userId, role: newRole },
    });

    if (error) {
      toast.error('Failed to update role');
    } else {
      toast.success('Role updated');
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, roles: [newRole] } : u
      ));
    }
    setUpdatingRole(null);
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const stats = {
    total: users.length,
    active7: users.filter(u => u.last_sign_in_at && differenceInDays(new Date(), new Date(u.last_sign_in_at)) <= 7).length,
    never: users.filter(u => !u.last_sign_in_at).length,
  };

  if (authLoading || !roleChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!user) return <StaffLogin />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-4 border rounded-xl p-6 bg-card">
          <Shield className="text-muted-foreground mx-auto" size={26} />
          <div>
            <h1 className="text-xl font-bold text-foreground">Agntive Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">This account is not an admin</p>
          </div>
          <Button variant="outline" className="w-full" onClick={() => supabase.auth.signOut()}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft size={20} />
            </Button>
            <Shield className="text-primary" size={28} />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Agntive Admin</h1>
              <p className="text-sm text-muted-foreground">Staff only — registrations and roles</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users size={18} />
            <span className="text-sm font-medium">{users.length} users</span>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          {[
            { label: 'Registered', value: stats.total, icon: Users },
            { label: 'Signed in last 7 days', value: stats.active7, icon: Clock },
            { label: 'Never signed in', value: stats.never, icon: UserX },
          ].map(card => (
            <div key={card.label} className="border rounded-xl bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <card.icon size={16} />
                <span className="text-xs font-medium uppercase tracking-wide">{card.label}</span>
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground tabular-nums">
                {loading ? '—' : card.value}
              </p>
            </div>
          ))}
        </div>


        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search by email, name, or username..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead className="text-center">Projects</TableHead>
                  <TableHead className="text-center">Tasks</TableHead>
                  <TableHead>Signed Up</TableHead>
                  <TableHead>Last Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={safeAvatarUrl(u.avatar_url)} />
                          <AvatarFallback className="text-xs">
                            {(u.display_name || u.email || '?').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-foreground truncate">
                              {u.display_name || '—'}
                            </p>
                            {u.suspicious && (
                              <Badge className="border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] px-1.5 py-0" variant="outline">
                                Suspicious
                              </Badge>
                            )}
                          </div>
                          {u.username && (
                            <p className="text-xs text-muted-foreground">@{u.username}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      {u.id === user?.id ? (
                        <Badge variant="destructive">admin</Badge>
                      ) : (
                        <Select
                          value={u.roles[0] || 'customer'}
                          onValueChange={(val) => handleRoleChange(u.id, val)}
                          disabled={updatingRole === u.id}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="agent">Agent</SelectItem>
                            <SelectItem value="customer">Customer</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                     </TableCell>
                    <TableCell>
                      {u.project_count + u.task_count > 0 ? (
                        <Badge variant="secondary" className="text-xs">Using</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Signed up only</span>
                      )}
                    </TableCell>
                     <TableCell className="text-center text-sm text-muted-foreground">
                       {u.project_count}
                     </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {u.task_count}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(u.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.last_sign_in_at
                        ? format(new Date(u.last_sign_in_at), 'MMM d, yyyy')
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
                {sortedUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      {search ? 'No users match your search.' : 'No users found.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Feedback */}
        <section className="mt-10">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquarePlus size={18} className="text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Product feedback</h2>
            <Badge variant="secondary" className="text-xs">{feedback.length}</Badge>
          </div>
          <div className="border rounded-xl divide-y bg-card">
            {feedback.map(f => (
              <div key={f.id} className="p-4 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs capitalize">{f.category}</Badge>
                  <span className="font-medium text-foreground">{f.email || '—'}</span>
                  <span>{format(new Date(f.created_at), 'MMM d, yyyy h:mm a')}</span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap break-words">{f.message}</p>
              </div>
            ))}
            {feedback.length === 0 && (
              <p className="p-8 text-center text-sm text-muted-foreground">No feedback yet.</p>
            )}
          </div>
        </section>
      </div>

    </div>
  );
};

export default AdminPage;
