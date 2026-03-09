import { useState, useEffect, useRef } from 'react';
import { Task } from '@/hooks/useTasks';
import { useNotes } from '@/hooks/useNotes';
import { useTaskAttachments } from '@/hooks/useTaskAttachments';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import TimeLogSection from './TimeLogSection';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Circle, PlayCircle, Check, Plus, Trash2, Pencil, X, Paperclip, FileText, Download, Loader2, Clock, StickyNote, File, CalendarDays, Bot, UserPlus } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

const statusConfig = {
  open: { icon: Circle, label: 'Open', dot: 'bg-[hsl(var(--status-open))]', badge: 'bg-[hsl(var(--status-open)/0.1)] text-[hsl(var(--status-open))]' },
  in_progress: { icon: PlayCircle, label: 'In Progress', dot: 'bg-[hsl(var(--status-progress))]', badge: 'bg-[hsl(var(--status-progress)/0.1)] text-[hsl(var(--status-progress))]' },
  complete: { icon: Check, label: 'Done', dot: 'bg-[hsl(var(--status-done))]', badge: 'bg-[hsl(var(--status-done)/0.1)] text-[hsl(var(--status-done))]' },
};

type Profile = { id: string; display_name: string | null; avatar_url: string | null };
type Assignee = { id: string; name: string; avatar_url?: string | null; type: 'user' | 'agent' };

type Props = {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalMinutes: number;
  onRename?: (id: string, newTitle: string) => Promise<void>;
  onUpdateStartDate?: (id: string, startDate: string | null) => Promise<void>;
  onUpdateDueDate?: (id: string, dueDate: string | null) => Promise<void>;
  onAssign?: (id: string, assigneeId: string, type: 'user' | 'agent') => Promise<void>;
  onUnassign?: (id: string) => Promise<void>;
  projectId?: string | null;
  teamId?: string | null;
};

const TaskDetailDialog = ({ task, open, onOpenChange, totalMinutes, onRename, onUpdateStartDate, onUpdateDueDate, onAssign, onUnassign, projectId, teamId }: Props) => {
  const { notes, loading, addNote, deleteNote } = useNotes(open ? task.id : null);
  const { attachments, loading: attachLoading, uploading, uploadFiles, deleteAttachment, getPublicUrl } = useTaskAttachments(open ? task.id : null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newNote, setNewNote] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);

  // Assignee state
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false);
  const [candidates, setCandidates] = useState<Assignee[]>([]);
  const [assigneeName, setAssigneeName] = useState<string | null>(null);
  const [assigneeAvatarUrl, setAssigneeAvatarUrl] = useState<string | null>(null);

  useEffect(() => { setDraftTitle(task.title); setEditingTitle(false); }, [task.title, open]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  // Fetch assignee candidates (team members + agents)
  useEffect(() => {
    if (!open || !projectId) return;
    const fetchCandidates = async () => {
      const results: Assignee[] = [];
      if (teamId) {
        const { data: members } = await supabase.from('team_members')
          .select('user_id, profiles:team_members_user_id_profiles_fkey(id, display_name, avatar_url)')
          .eq('team_id', teamId);
        if (members) {
          members.forEach((m: any) => {
            const p = m.profiles;
            if (p) results.push({ id: p.id, name: p.display_name || 'Unknown', avatar_url: p.avatar_url, type: 'user' });
          });
        }
      } else {
        const { data: proj } = await supabase.from('projects').select('owner_id').eq('id', projectId).single();
        if (proj) {
          const { data: ownerProfile } = await supabase.from('profiles').select('id, display_name, avatar_url').eq('id', proj.owner_id).single();
          if (ownerProfile) results.push({ id: ownerProfile.id, name: ownerProfile.display_name || 'Unknown', avatar_url: ownerProfile.avatar_url, type: 'user' });
        }
      }
      const { data: agentRows } = await supabase.from('agent_projects')
        .select('agent_id, agents(id, display_name)')
        .eq('project_id', projectId);
      if (agentRows) {
        agentRows.forEach((r: any) => {
          const a = r.agents;
          if (a) results.push({ id: a.id, name: a.display_name, type: 'agent' });
        });
      }
      setCandidates(results);
    };
    fetchCandidates();
  }, [open, projectId, teamId]);

  // Resolve current assignee name
  useEffect(() => {
    if (!task.assigned_to || !task.assigned_type) {
      setAssigneeName(null);
      setAssigneeAvatarUrl(null);
      return;
    }
    const found = candidates.find(c => c.id === task.assigned_to);
    if (found) {
      setAssigneeName(found.name);
      setAssigneeAvatarUrl(found.avatar_url || null);
      return;
    }
    if (task.assigned_type === 'user') {
      supabase.from('profiles').select('display_name, avatar_url').eq('id', task.assigned_to).single()
        .then(({ data }) => { if (data) { setAssigneeName(data.display_name); setAssigneeAvatarUrl(data.avatar_url); } });
    } else {
      supabase.from('agents').select('display_name').eq('id', task.assigned_to).single()
        .then(({ data }) => { if (data) { setAssigneeName(data.display_name); setAssigneeAvatarUrl(null); } });
    }
  }, [task.assigned_to, task.assigned_type, candidates]);

  useEffect(() => {
    if (!notes.length) return;
    const userIds = [...new Set(notes.map(n => n.user_id))];
    const missing = userIds.filter(id => !profiles[id]);
    if (!missing.length) return;
    supabase.from('profiles').select('id, display_name, avatar_url').in('id', missing)
      .then(({ data }) => {
        if (data) {
          setProfiles(prev => {
            const next = { ...prev };
            data.forEach((p: Profile) => { next[p.id] = p; });
            return next;
          });
        }
      });
  }, [notes]);

  const config = statusConfig[task.status];

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await addNote(newNote.trim());
      setNewNote('');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const timeDisplay = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  // Filter candidates based on search (strip leading @)
  const searchTerm = assigneeSearch.replace(/^@/, '').toLowerCase();
  const filteredCandidates = candidates.filter(c => c.name.toLowerCase().includes(searchTerm));

  const handleSelectAssignee = async (candidate: Assignee) => {
    setAssigneeDropdownOpen(false);
    setAssigneeSearch('');
    try {
      await onAssign?.(task.id, candidate.id, candidate.type);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleUnassign = async () => {
    try {
      await onUnassign?.(task.id);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-lg flex items-center gap-2">
            {editingTitle ? (
              <form onSubmit={async (e) => { e.preventDefault(); if (!draftTitle.trim()) return; try { await onRename?.(task.id, draftTitle.trim()); setEditingTitle(false); } catch (err: any) { toast.error(err.message); } }} className="flex items-center gap-1.5 flex-1">
                <Input value={draftTitle} onChange={e => setDraftTitle(e.target.value)} autoFocus className="h-8 text-lg font-semibold" />
                <Button type="submit" size="icon" variant="ghost" className="h-7 w-7 shrink-0"><Check size={14} /></Button>
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => { setEditingTitle(false); setDraftTitle(task.title); }}><X size={14} /></Button>
              </form>
            ) : (
              <>
                {task.title}
                {onRename && <button onClick={() => setEditingTitle(true)} className="text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>}
              </>
            )}
          </SheetTitle>
          <SheetDescription>Task details & notes</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Status & Time */}
          <div className="flex items-center gap-4 text-sm">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
              {config.label}
            </span>
            <span className="text-muted-foreground">Time: <span className="font-bold text-foreground">{timeDisplay}</span></span>
          </div>

          {/* Assignee */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <UserPlus size={12} /> Assignee
            </span>
            {task.assigned_to && assigneeName ? (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-medium">
                {task.assigned_type === 'agent' ? (
                  <Bot size={12} className="text-[hsl(var(--sidebar-panel-active))]" />
                ) : (
                  <Avatar className="h-4 w-4">
                    {assigneeAvatarUrl && <AvatarImage src={assigneeAvatarUrl} />}
                    <AvatarFallback className="text-[8px]">{getInitials(assigneeName)}</AvatarFallback>
                  </Avatar>
                )}
                <span>{assigneeName}</span>
                {onUnassign && (
                  <button onClick={handleUnassign} className="text-muted-foreground hover:text-destructive ml-0.5">
                    <X size={12} />
                  </button>
                )}
              </div>
            ) : (
              <Popover open={assigneeDropdownOpen} onOpenChange={setAssigneeDropdownOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs rounded-lg">
                    <Plus size={12} />
                    Assign
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="start">
                  <Input
                    placeholder="Type @ to search..."
                    value={assigneeSearch}
                    onChange={e => setAssigneeSearch(e.target.value)}
                    autoFocus
                    className="h-8 text-xs mb-2"
                  />
                  <div className="max-h-48 overflow-y-auto space-y-0.5">
                    {filteredCandidates.length === 0 ? (
                      <p className="text-xs text-muted-foreground px-2 py-1.5">No matches</p>
                    ) : (
                      filteredCandidates.map(c => (
                        <button
                          key={c.id}
                          onClick={() => handleSelectAssignee(c)}
                          className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-xs hover:bg-accent transition-colors text-left"
                        >
                          {c.type === 'agent' ? (
                            <Bot size={14} className="text-[hsl(var(--sidebar-panel-active))] shrink-0" />
                          ) : (
                            <Avatar className="h-5 w-5 shrink-0">
                              {c.avatar_url && <AvatarImage src={c.avatar_url} />}
                              <AvatarFallback className="text-[8px]">{getInitials(c.name)}</AvatarFallback>
                            </Avatar>
                          )}
                          <span className="truncate">{c.name}</span>
                          <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{c.type === 'agent' ? 'Agent' : 'Member'}</span>
                        </button>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Dates */}
          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            <span>Created: {format(new Date(task.created_at), 'PPp')}</span>
            {task.completed_at && <span>Completed: {format(new Date(task.completed_at), 'PPp')}</span>}
            
            {/* Start Date */}
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Start:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs rounded-lg">
                    <CalendarDays size={12} />
                    {task.start_date ? format(parseISO(task.start_date), 'PPP') : 'Set start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={task.start_date ? parseISO(task.start_date) : undefined}
                    onSelect={(date) => {
                      const val = date ? format(date, 'yyyy-MM-dd') : null;
                      onUpdateStartDate?.(task.id, val);
                    }}
                    className="p-3 pointer-events-auto"
                  />
                  {task.start_date && (
                    <div className="px-3 pb-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-destructive hover:text-destructive"
                        onClick={() => onUpdateStartDate?.(task.id, null)}
                      >
                        Clear start date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Due:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs rounded-lg">
                    <CalendarDays size={12} />
                    {task.due_date ? format(parseISO(task.due_date), 'PPP') : 'Set due date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={task.due_date ? parseISO(task.due_date) : undefined}
                    onSelect={(date) => {
                      const val = date ? format(date, 'yyyy-MM-dd') : null;
                      onUpdateDueDate?.(task.id, val);
                    }}
                    className="p-3 pointer-events-auto"
                  />
                  {task.due_date && (
                    <div className="px-3 pb-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-destructive hover:text-destructive"
                        onClick={() => onUpdateDueDate?.(task.id, null)}
                      >
                        Clear due date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Separator />

          {/* Time Log */}
          <div>
            <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Clock size={12} /> Time Log
            </p>
            <TimeLogSection taskId={task.id} />
          </div>

          <Separator />

          {/* Notes */}
          <div>
            <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <StickyNote size={12} /> Notes
            </p>
            <form onSubmit={handleAddNote} className="mb-4 flex gap-2">
              <div className="flex-1 flex items-center gap-2 rounded-xl border border-border bg-background px-3 shadow-sm">
                <Input
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  className="text-sm border-0 shadow-none focus-visible:ring-0 bg-transparent px-0"
                />
              </div>
              <Button type="submit" size="icon" variant="ghost" className="shrink-0 rounded-lg">
                <Plus size={16} />
              </Button>
            </form>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            ) : (
              <div className="space-y-2.5">
                {notes.map(note => {
                  const profile = profiles[note.user_id];
                  return (
                    <div key={note.id} className="group flex items-start gap-3 rounded-xl border border-border p-3 transition-card hover:shadow-sm">
                      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                        {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
                        <AvatarFallback className="text-[10px]">{getInitials(profile?.display_name ?? null)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-foreground">{profile?.display_name ?? 'Unknown'}</span>
                          <span className="text-[10px] text-muted-foreground">{format(new Date(note.created_at), 'PP p')}</span>
                        </div>
                        <p className="text-sm text-foreground">{note.content}</p>
                      </div>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Separator />

          {/* Attachments */}
          <div>
            <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <File size={12} /> Attachments
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) {
                  uploadFiles(e.target.files).catch(err => toast.error(err.message));
                  e.target.value = '';
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="mb-4 gap-2 rounded-lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Paperclip size={14} />}
              {uploading ? 'Uploading...' : 'Attach files'}
            </Button>

            {attachLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : attachments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attachments yet.</p>
            ) : (
              <div className="space-y-2">
                {attachments.map(att => {
                  const isImage = att.content_type?.startsWith('image/');
                  const url = getPublicUrl(att.file_path);
                  const sizeKb = att.file_size ? Math.round(att.file_size / 1024) : null;
                  return (
                    <div key={att.id} className="group flex items-center gap-3 rounded-xl border border-border p-3 transition-card hover:bg-accent/50 hover:shadow-sm">
                      {isImage ? (
                        <img src={url} alt={att.file_name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <FileText size={18} className="text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{att.file_name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {sizeKb !== null && `${sizeKb} KB · `}{format(new Date(att.created_at), 'PP')}
                        </p>
                      </div>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground hover:text-foreground">
                        <Download size={14} />
                      </a>
                      <button
                        onClick={() => deleteAttachment(att).catch(err => toast.error(err.message))}
                        className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TaskDetailDialog;
