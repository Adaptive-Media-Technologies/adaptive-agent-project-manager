import { useState, useRef } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Camera, LogOut, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ProfileSheet = ({ open, onOpenChange }: Props) => {
  const { user, signOut } = useAuth();
  const { profile, updateProfile, uploadAvatar } = useProfile();
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Sync local state when profile loads
  const currentName = displayName || profile?.display_name || '';

  const handleSave = async () => {
    if (!currentName.trim()) return;
    setSaving(true);
    try {
      await updateProfile({ display_name: currentName.trim() });
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.message);
    }
    setSaving(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    try {
      await uploadAvatar(file);
      toast.success('Avatar updated');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="mb-6">
          <SheetTitle>Profile</SheetTitle>
          <SheetDescription>Update your profile information</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="h-20 w-20">
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
                <AvatarFallback className="text-lg">{getInitials(profile?.display_name ?? null)}</AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 rounded-full border-2 border-background bg-primary p-1.5 text-primary-foreground hover:bg-primary/90"
              >
                <Camera size={14} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              value={currentName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled className="text-muted-foreground" />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>

          <Separator />

          {/* Change Password */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><KeyRound size={14} /> Change Password</Label>
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              minLength={6}
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              minLength={6}
            />
            <Button
              variant="outline"
              className="w-full"
              disabled={changingPassword || !newPassword || !confirmPassword}
              onClick={async () => {
                if (newPassword !== confirmPassword) {
                  toast.error("Passwords don't match");
                  return;
                }
                if (newPassword.length < 6) {
                  toast.error('Password must be at least 6 characters');
                  return;
                }
                setChangingPassword(true);
                try {
                  const { error } = await supabase.auth.updateUser({ password: newPassword });
                  if (error) throw error;
                  toast.success('Password updated');
                  setNewPassword('');
                  setConfirmPassword('');
                } catch (err: any) {
                  toast.error(err.message);
                }
                setChangingPassword(false);
              }}
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </div>

          <Separator />

          <Button variant="outline" onClick={signOut} className="w-full gap-2">
            <LogOut size={14} /> Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileSheet;
