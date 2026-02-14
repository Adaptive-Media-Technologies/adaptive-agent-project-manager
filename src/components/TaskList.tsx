import { Task } from '@/hooks/useTasks';
import TaskItem from './TaskItem';
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
};

const TaskList = ({ tasks, onCycle, onDelete, onReorder, onLogTime }: Props) => {
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

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {tasks.map(t => (
            <TaskItem
              key={t.id}
              task={t}
              onCycle={() => onCycle(t)}
              onDelete={() => onDelete(t.id)}
              onLogTime={onLogTime ? (min) => onLogTime(t.id, min) : undefined}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default TaskList;
