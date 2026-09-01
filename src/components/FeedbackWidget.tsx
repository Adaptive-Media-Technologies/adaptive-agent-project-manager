import { useState } from 'react';
import { MessageSquarePlus, X, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const MAX_LEN = 2000;

// Same rules as the profiles sanitizer: strip tags, strip stray brackets, trim.
const sanitize = (value: string) =>
  value.replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim().slice(0, MAX_LEN);

const FeedbackWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('idea');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async () => {
    const clean = sanitize(message);
    if (!clean) {
      toast.error('Please add a short message.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('product_feedback').insert({
      user_id: user.id,
      email: user.email ?? null,
      category,
      message: clean,
    });
    setSubmitting(false);

    if (error) {
      console.error(error);
      toast.error('Could not send feedback. Please try again.');
      return;
    }

    toast.success('Thanks — feedback sent.');
    setMessage('');
    setCategory('idea');
    setOpen(false);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-[60] flex items-center gap-2 rounded-full border border-border bg-card/95 px-4 py-2.5 text-sm font-medium text-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-accent"
          title="Send feedback"
          type="button"
        >
          <MessageSquarePlus size={16} />
          Feedback
        </button>
      )}

      {open && (
        <div className="fixed bottom-4 right-4 z-[60] w-[min(360px,calc(100vw-2rem))] rounded-xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Send feedback</h2>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground" type="button" title="Close">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input value={user.email ?? ''} readOnly disabled className="h-9 text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="idea">Idea</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MAX_LEN))}
                maxLength={MAX_LEN}
                rows={4}
                placeholder="What could be better?"
                className="text-sm resize-none"
              />
              <p className="text-right text-[11px] text-muted-foreground">{message.length}/{MAX_LEN}</p>
            </div>

            <Button onClick={handleSubmit} disabled={submitting} className="w-full gap-2">
              <Send size={14} />
              {submitting ? 'Sending…' : 'Send feedback'}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackWidget;
