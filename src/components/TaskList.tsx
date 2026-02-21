import { useState, useEffect } from 'react';
import { Task } from '@/hooks/useTasks';
import { supabase } from '@/integrations/supabase/client';
import TaskItem from './TaskItem';
import TaskDetailDialog from './TaskDetailDialog';
import Stopwatch from './Stopwatch';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

type AssigneeInfo = { name: string; avatar_url?: string | null; type: 'user' | 'agent' };

type Props = {
  tasks: Task[];
  onCycle: (task: Task) => void;
  onDelete: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onLogTime?: (taskId: string, minutes: number) => void;
  taskMinutes?: Record<string, number>;
  onRenameTask?: (id: string, newTitle: string) => Promise<void>;
  onUpdateDueDate?: (id: string, dueDate: string | null) => Promise<void>;
  onAssignTask?: (id: string, assigneeId: string, type: 'user' | 'agent') => Promise<void>;
  onUnassignTask?: (id: string) => Promise<void>;
  projectId?: string | null;
  teamId?: string | null;
};

const TaskList = ({ tasks, onCycle, onDelete, onReorder, onLogTime, taskMinutes = {}, onRenameTask, onUpdateDueDate, onAssignTask, onUnassignTask, projectId, teamId }: Props) => {
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [assigneeMap, setAssigneeMap] = useState<Record<string, AssigneeInfo>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Resolve assignee display info for all assigned tasks
  useEffect(() => {
    const assigned = tasks.filter(t => t.assigned_to && t.assigned_type);
    if (!assigned.length) { setAssigneeMap({}); return; }

    const userIds = assigned.filter(t => t.assigned_type === 'user').map(t => t.assigned_to!);
    const agentIds = assigned.filter(t => t.assigned_type === 'agent').map(t => t.assigned_to!);

    const fetchAll = async () => {
      const map: Record<string, AssigneeInfo> = {};
      if (userIds.length) {
        const { data } = await supabase.from('profiles').select('id, display_name, avatar_url').in('id', userIds);
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = tasks.findIndex(t => t.id === active.id);
    const toIndex = tasks.findIndex(t => t.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) onReorder(fromIndex, toIndex);
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
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {tasks.map(t => {
              const info = t.assigned_to ? assigneeMap[t.assigned_to] : undefined;
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
                  assigneeType={info?.type}
                  assigneeAvatarUrl={info?.avatar_url}
                />
              );
            })}
          </div>
        </SortableContext>
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
