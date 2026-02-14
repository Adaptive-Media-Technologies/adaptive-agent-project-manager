import { useState } from 'react';
import { Task } from '@/hooks/useTasks';
import TaskItem from './TaskItem';
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

type Props = {
  tasks: Task[];
  onCycle: (task: Task) => void;
  onDelete: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onLogTime?: (taskId: string, minutes: number) => void;
  taskMinutes?: Record<string, number>;
};

const TaskList = ({ tasks, onCycle, onDelete, onReorder, onLogTime, taskMinutes = {} }: Props) => {
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = tasks.findIndex(t => t.id === active.id);
    const toIndex = tasks.findIndex(t => t.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) onReorder(fromIndex, toIndex);
  };

  const activeTask = activeTimerTaskId ? tasks.find(t => t.id === activeTimerTaskId) : null;
  const existingSeconds = activeTimerTaskId ? (taskMinutes[activeTimerTaskId] || 0) * 60 : 0;

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
            {tasks.map(t => (
              <TaskItem
                key={t.id}
                task={t}
                onCycle={() => onCycle(t)}
                onDelete={() => onDelete(t.id)}
                onStartTimer={() => setActiveTimerTaskId(activeTimerTaskId === t.id ? null : t.id)}
                isTimerActive={activeTimerTaskId === t.id}
              />
            ))}
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
    </>
  );
};

export default TaskList;
