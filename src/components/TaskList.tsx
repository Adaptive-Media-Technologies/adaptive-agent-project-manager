import { useMemo, useState, useEffect, useRef } from 'react';
import { Task } from '@/hooks/useTasks';
import type { TaskGroup } from '@/hooks/useTaskGroups';
import { supabase } from '@/integrations/supabase/client';
import TaskItem from './TaskItem';
import TaskDetailDialog from './TaskDetailDialog';
import Stopwatch from './Stopwatch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

type AssigneeInfo = { name: string; avatar_url?: string | null; type: 'user' | 'agent' };

type ContainerId = string; // task group id, or 'ungrouped'

type Props = {
  tasks: Task[];
  groups: TaskGroup[];
  onCreateGroup: (name: string) => Promise<void> | void;
  onRenameGroup: (id: string, name: string) => Promise<void> | void;
  onUpdateGroupDates?: (id: string, startDate: string | null, endDate: string | null) => Promise<void> | void;
  onDeleteGroup: (id: string) => Promise<void> | void;
  onCycle: (task: Task) => void;
  onDelete: (id: string) => void;
  onReorderGrouped: (groups: { group_id: string | null; task_ids: string[] }[]) => Promise<void> | void;
  onLogTime?: (taskId: string, minutes: number) => void;
  taskMinutes?: Record<string, number>;
  onRenameTask?: (id: string, newTitle: string) => Promise<void>;
  onUpdateStartDate?: (id: string, startDate: string | null) => Promise<void>;
  onUpdateDueDate?: (id: string, dueDate: string | null) => Promise<void>;
  onAssignTask?: (id: string, assigneeId: string, type: 'user' | 'agent') => Promise<void>;
  onUnassignTask?: (id: string) => Promise<void>;
  openTaskId?: string | null;
  onOpenedTaskId?: () => void;
  projectId?: string | null;
  teamId?: string | null;
};

const UNGROUPED_ID: ContainerId = 'ungrouped';

const GroupDropZone = ({ id, children }: { id: ContainerId; children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={isOver ? 'ring-2 ring-primary/30 rounded-xl' : ''}>
      {children}
    </div>
  );
};

const TaskList = ({ tasks, groups, onCreateGroup, onRenameGroup, onUpdateGroupDates, onDeleteGroup, onCycle, onDelete, onReorderGrouped, onLogTime, taskMinutes = {}, onRenameTask, onUpdateStartDate, onUpdateDueDate, onAssignTask, onUnassignTask, openTaskId, onOpenedTaskId, projectId, teamId }: Props) => {
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [assigneeMap, setAssigneeMap] = useState<Record<string, AssigneeInfo>>({});
  const [itemsByContainer, setItemsByContainer] = useState<Record<ContainerId, string[]>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addGroupOpen, setAddGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editDatesGroupId, setEditDatesGroupId] = useState<string | null>(null);
  const [draftGroupStart, setDraftGroupStart] = useState<string | null>(null);
  const [draftGroupEnd, setDraftGroupEnd] = useState<string | null>(null);

  const saveInFlightRef = useRef(false);
  const pendingSaveRef = useRef<{ group_id: string | null; task_ids: string[] }[] | null>(null);
  const dragStartSnapshotRef = useRef<Record<ContainerId, string[]> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const tasksById = useMemo(() => {
    const map = new Map<string, Task>();
    tasks.forEach(t => map.set(t.id, t));
    return map;
  }, [tasks]);

  const orderedContainers: ContainerId[] = useMemo(() => {
    const ordered = groups.slice().sort((a, b) => a.position - b.position).map(g => g.id);
    return [...ordered, UNGROUPED_ID];
  }, [groups]);

  // Keep internal DnD ordering in sync with latest tasks/groups.
  useEffect(() => {
    const next: Record<ContainerId, string[]> = {};
    orderedContainers.forEach(cid => { next[cid] = []; });
    // Ensure deterministic within-group order by position.
    const sortedTasks = tasks.slice().sort((a, b) => a.position - b.position);
    for (const t of sortedTasks) {
      const cid = t.group_id ?? UNGROUPED_ID;
      if (!next[cid]) next[cid] = [];
      next[cid].push(t.id);
    }
    // Ensure all containers exist
    orderedContainers.forEach(cid => { if (!next[cid]) next[cid] = []; });
    setItemsByContainer(next);
  }, [tasks, orderedContainers]);

  // Resolve assignee display info for all tasks (default to creator)
  useEffect(() => {
    if (!tasks.length) { setAssigneeMap({}); return; }

    const fetchAll = async () => {
      const map: Record<string, AssigneeInfo> = {};

      // Collect all user IDs we need to resolve: explicit assignees + creators as fallback
      const explicitUserIds = tasks.filter(t => t.assigned_to && t.assigned_type === 'user').map(t => t.assigned_to!);
      const creatorIds = tasks.filter(t => !t.assigned_to).map(t => (t as any).created_by).filter(Boolean);
      const allUserIds = [...new Set([...explicitUserIds, ...creatorIds])];
      const agentIds = [...new Set(tasks.filter(t => t.assigned_to && t.assigned_type === 'agent').map(t => t.assigned_to!))];

      if (allUserIds.length) {
        const { data } = await supabase.from('profiles').select('id, display_name, avatar_url').in('id', allUserIds);
        data?.forEach(p => { map[p.id] = { name: p.display_name || 'Unknown', avatar_url: p.avatar_url, type: 'user' }; });
      }
      if (agentIds.length) {
        const { data } = await supabase.from('agents').select('id, display_name').in('id', agentIds);
        data?.forEach(a => { map[a.id] = { name: a.display_name, type: 'agent' }; });
      }
      setAssigneeMap(map);
    };
    fetchAll();
  }, [tasks]);

  // Deep-link open: allow parent (dashboard) to request opening a specific task.
  useEffect(() => {
    if (!openTaskId) return;
    const exists = tasks.some(t => t.id === openTaskId);
    if (!exists) return;
    setDetailTaskId(openTaskId);
    onOpenedTaskId?.();
  }, [openTaskId, tasks, onOpenedTaskId]);

  const findContainer = (id: string): ContainerId | null => {
    if (id in itemsByContainer) return id;
    for (const cid of Object.keys(itemsByContainer)) {
      if (itemsByContainer[cid].includes(id)) return cid;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    dragStartSnapshotRef.current = Object.fromEntries(
      Object.entries(itemsByContainer).map(([k, v]) => [k, [...v]])
    ) as Record<ContainerId, string[]>;
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = String(active.id);
    const overId = String(over.id);

    const activeContainer = findContainer(activeTaskId);
    const overContainer = findContainer(overId);
    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) return;

    setItemsByContainer((prev) => {
      const next = { ...prev };
      const fromItems = [...(next[activeContainer] || [])];
      const toItems = [...(next[overContainer] || [])];

      const fromIndex = fromItems.indexOf(activeTaskId);
      if (fromIndex === -1) return prev;
      fromItems.splice(fromIndex, 1);

      const overIndex = toItems.indexOf(overId);
      const insertIndex = overId in prev ? toItems.length : Math.max(0, overIndex);
      toItems.splice(insertIndex, 0, activeTaskId);

      next[activeContainer] = fromItems;
      next[overContainer] = toItems;
      return next;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    const before = dragStartSnapshotRef.current;
    dragStartSnapshotRef.current = null;
    if (!over) return;

    const activeTaskId = String(active.id);
    const overId = String(over.id);

    const activeContainer = findContainer(activeTaskId);
    const overContainer = findContainer(overId);
    if (!activeContainer || !overContainer) return;

    const requestSave = async (payload: { group_id: string | null; task_ids: string[] }[]) => {
      pendingSaveRef.current = payload;
      if (saveInFlightRef.current) return;
      saveInFlightRef.current = true;
      setIsSaving(true);
      try {
        while (pendingSaveRef.current) {
          const next = pendingSaveRef.current;
          pendingSaveRef.current = null;
          await onReorderGrouped(next);
        }
      } catch (err: any) {
        toast.error(err?.message || 'Failed to save task order');
      } finally {
        saveInFlightRef.current = false;
        setIsSaving(false);
      }
    };

    // Compute deterministic "next" state for persistence. We cannot rely on itemsByContainer
    // always being updated by onDragOver before dragEnd fires.
    let next: Record<ContainerId, string[]> = itemsByContainer;

    if (activeContainer === overContainer) {
      const items = next[activeContainer] || [];
      const oldIndex = items.indexOf(activeTaskId);
      const newIndex = items.indexOf(overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const nextItems = arrayMove(items, oldIndex, newIndex);
        next = { ...next, [activeContainer]: nextItems };
        setItemsByContainer(next);
      }
      // If dropped on container itself, order may still have changed via onDragOver.
    } else {
      const current = next;
      const fromItems = [...(current[activeContainer] || [])];
      const toItems = [...(current[overContainer] || [])];

      if (!toItems.includes(activeTaskId)) {
        const fromIdx = fromItems.indexOf(activeTaskId);
        if (fromIdx !== -1) fromItems.splice(fromIdx, 1);
        const overIndex = toItems.indexOf(overId);
        const insertIndex = overId in current ? toItems.length : Math.max(0, overIndex);
        toItems.splice(insertIndex, 0, activeTaskId);
      }

      next = { ...current, [activeContainer]: fromItems, [overContainer]: toItems };
      setItemsByContainer(next);
    }

    const changed =
      !before ||
      Object.keys(next).some((cid) => {
        const a = before[cid] || [];
        const b = next[cid] || [];
        if (a.length !== b.length) return true;
        for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return true;
        return false;
      });

    if (!changed) return;

    await requestSave(
      orderedContainers.map((cid) => ({
        group_id: cid === UNGROUPED_ID ? null : cid,
        task_ids: next[cid] || [],
      }))
    );
  };

  const activeTask = activeTimerTaskId ? tasks.find(t => t.id === activeTimerTaskId) : null;
  const existingSeconds = activeTimerTaskId ? (taskMinutes[activeTimerTaskId] || 0) * 60 : 0;
  const detailTask = detailTaskId ? tasks.find(t => t.id === detailTaskId) : null;

  const handleStopTimer = (totalSeconds: number) => {
    if (!activeTimerTaskId || !onLogTime) return;
    const existingSecs = (taskMinutes[activeTimerTaskId] || 0) * 60;
    const newMinutes = Math.round((totalSeconds - existingSecs) / 60 * 100) / 100;
    if (newMinutes > 0) {
      onLogTime(activeTimerTaskId, Math.ceil(newMinutes));
    }
  };

  return (
    <>
      {/* Add Group dialog */}
      <Dialog open={addGroupOpen} onOpenChange={setAddGroupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add group</DialogTitle>
            <DialogDescription>Create a new task group for this project (e.g., “Sprint 1”).</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              placeholder="Group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddGroupOpen(false); setNewGroupName(''); }}>
              Cancel
            </Button>
            <Button
              disabled={!newGroupName.trim() || !projectId}
              onClick={async () => {
                if (!projectId) return;
                await onCreateGroup(newGroupName.trim());
                setAddGroupOpen(false);
                setNewGroupName('');
              }}
            >
              <Plus size={14} /> Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit group dates dialog */}
      <Dialog
        open={!!editDatesGroupId}
        onOpenChange={(open) => {
          if (!open) setEditDatesGroupId(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Group dates</DialogTitle>
            <DialogDescription>Optional start/end dates for this group.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground">Start date</p>
              <Input
                type="date"
                value={draftGroupStart ?? ''}
                onChange={(e) => setDraftGroupStart(e.target.value ? e.target.value : null)}
              />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground">End date</p>
              <Input
                type="date"
                value={draftGroupEnd ?? ''}
                onChange={(e) => setDraftGroupEnd(e.target.value ? e.target.value : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDatesGroupId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                if (!editDatesGroupId) return;
                await onUpdateGroupDates?.(editDatesGroupId, null, null);
                setEditDatesGroupId(null);
              }}
            >
              Clear
            </Button>
            <Button
              onClick={async () => {
                if (!editDatesGroupId) return;
                await onUpdateGroupDates?.(editDatesGroupId, draftGroupStart, draftGroupEnd);
                setEditDatesGroupId(null);
              }}
              disabled={!editDatesGroupId || !onUpdateGroupDates}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="space-y-4 pb-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Groups
            </p>
            <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => setAddGroupOpen(true)} disabled={!projectId}>
              <Plus size={14} /> Add group
            </Button>
          </div>

          {isSaving && (
            <div className="text-[11px] text-muted-foreground">
              Saving order…
            </div>
          )}

          {orderedContainers.map((cid) => {
            const group = groups.find((g) => g.id === cid);
            const label = cid === UNGROUPED_ID ? 'Ungrouped' : (group?.name || 'Group');
            const ids = itemsByContainer[cid] || [];
            const groupStart = cid !== UNGROUPED_ID ? (group?.start_date ?? null) : null;
            const groupEnd = cid !== UNGROUPED_ID ? (group?.end_date ?? null) : null;
            const groupDateLabel =
              groupStart && groupEnd
                ? `${format(parseISO(groupStart), 'MMM d')} – ${format(parseISO(groupEnd), 'MMM d')}`
                : groupStart
                  ? `Starts ${format(parseISO(groupStart), 'MMM d')}`
                  : groupEnd
                    ? `Ends ${format(parseISO(groupEnd), 'MMM d')}`
                    : null;
            return (
              <GroupDropZone key={cid} id={cid}>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{label}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[11px] text-muted-foreground">
                          {ids.length} task{ids.length !== 1 ? 's' : ''}
                        </p>
                        {groupDateLabel && (
                          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            {groupDateLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    {cid !== UNGROUPED_ID && group && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            title="Group actions"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={async () => {
                              const next = window.prompt('Rename group', group.name);
                              if (next && next.trim() && next.trim() !== group.name) {
                                await onRenameGroup(group.id, next.trim());
                              }
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditDatesGroupId(group.id);
                              setDraftGroupStart((group as any).start_date ?? null);
                              setDraftGroupEnd((group as any).end_date ?? null);
                            }}
                            disabled={!onUpdateGroupDates}
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Edit dates
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={async () => {
                              const ok = window.confirm('Delete this group? Tasks will move to Ungrouped.');
                              if (ok) await onDeleteGroup(group.id);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <div className="px-3">
                    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2 py-1">
                        {ids.map((taskId) => {
                          const t = tasksById.get(taskId);
                          if (!t) return null;
                          const assigneeId = t.assigned_to || (t as any).created_by;
                          const info = assigneeId ? assigneeMap[assigneeId] : undefined;
                          const effectiveType = t.assigned_to ? info?.type : 'user';
                          return (
                            <TaskItem
                              key={t.id}
                              task={t}
                              onCycle={() => onCycle(t)}
                              onDelete={() => onDelete(t.id)}
                              onStartTimer={() => setActiveTimerTaskId(activeTimerTaskId === t.id ? null : t.id)}
                              isTimerActive={activeTimerTaskId === t.id}
                              totalMinutes={taskMinutes[t.id] || 0}
                              onOpenDetail={() => setDetailTaskId(t.id)}
                              assigneeName={info?.name}
                              assigneeType={effectiveType}
                              assigneeAvatarUrl={info?.avatar_url}
                            />
                          );
                        })}
                        {ids.length === 0 && (
                          <div className="py-4 text-center text-sm text-muted-foreground">
                            Drop tasks here
                          </div>
                        )}
                      </div>
                    </SortableContext>
                  </div>
                </div>
              </GroupDropZone>
            );
          })}
        </div>
      </DndContext>

      {activeTask && (
        <Stopwatch
          taskTitle={activeTask.title}
          initialSeconds={existingSeconds}
          onStop={handleStopTimer}
          onClose={() => setActiveTimerTaskId(null)}
        />
      )}

      {detailTask && (
        <TaskDetailDialog
          task={detailTask}
          open={!!detailTaskId}
          onOpenChange={open => { if (!open) setDetailTaskId(null); }}
          totalMinutes={taskMinutes[detailTask.id] || 0}
          onRename={onRenameTask}
          onUpdateStartDate={onUpdateStartDate}
          onUpdateDueDate={onUpdateDueDate}
          onAssign={onAssignTask}
          onUnassign={onUnassignTask}
          projectId={projectId}
          teamId={teamId}
        />
      )}
    </>
  );
};

export default TaskList;
