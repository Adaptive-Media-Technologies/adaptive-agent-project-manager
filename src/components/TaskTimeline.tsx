import { useMemo, useState } from 'react';
import type { Task } from '@/hooks/useTasks';
import { addDays, differenceInCalendarDays, format, isAfter, isBefore, isSameDay, parseISO, startOfDay } from 'date-fns';
import TaskDetailDialog from '@/components/TaskDetailDialog';

export type TimelineSection = {
  id: string;
  label: string;
  taskIds: string[];
};

type Props = {
  tasks: Task[];
  sections: TimelineSection[];
  rangeStart: Date;
  rangeEnd: Date;
  selectedDate?: Date | null;
  taskMinutes?: Record<string, number>;
  onRenameTask?: (id: string, newTitle: string) => Promise<void>;
  onUpdateStartDate?: (id: string, startDate: string | null) => Promise<void>;
  onUpdateDueDate?: (id: string, dueDate: string | null) => Promise<void>;
  onAssignTask?: (id: string, assigneeId: string, type: 'user' | 'agent') => Promise<void>;
  onUnassignTask?: (id: string) => Promise<void>;
  projectId?: string | null;
  teamId?: string | null;
};

const CELL_W = 34;
const LEFT_W = 280;
const ROW_H = 40;
const SECTION_H = 32;
const HEADER_H = 44;

const parseDateOnly = (value: string) => startOfDay(parseISO(value));

const clampDayIndex = (idx: number, max: number) => Math.max(0, Math.min(max, idx));

const statusToClassName: Record<Task['status'], string> = {
  open: 'bg-[hsl(var(--status-open))]/80',
  in_progress: 'bg-[hsl(var(--status-progress))]/80',
  complete: 'bg-[hsl(var(--status-done))]/80',
  archived: 'bg-muted-foreground/40',
};

export default function TaskTimeline({
  tasks,
  sections,
  rangeStart,
  rangeEnd,
  selectedDate = null,
  taskMinutes = {},
  onRenameTask,
  onUpdateStartDate,
  onUpdateDueDate,
  onAssignTask,
  onUnassignTask,
  projectId,
  teamId,
}: Props) {
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);

  const tasksById = useMemo(() => {
    const m: Record<string, Task> = {};
    tasks.forEach(t => { m[t.id] = t; });
    return m;
  }, [tasks]);

  const dayCount = useMemo(() => {
    const start = startOfDay(rangeStart);
    const end = startOfDay(rangeEnd);
    return Math.max(1, differenceInCalendarDays(end, start) + 1);
  }, [rangeStart, rangeEnd]);

  const days = useMemo(() => {
    const start = startOfDay(rangeStart);
    return Array.from({ length: dayCount }, (_, i) => addDays(start, i));
  }, [rangeStart, dayCount]);

  const todayIdx = useMemo(() => {
    const idx = differenceInCalendarDays(startOfDay(new Date()), startOfDay(rangeStart));
    return idx >= 0 && idx < dayCount ? idx : null;
  }, [rangeStart, dayCount]);

  const selectedIdx = useMemo(() => {
    if (!selectedDate) return null;
    const idx = differenceInCalendarDays(startOfDay(selectedDate), startOfDay(rangeStart));
    return idx >= 0 && idx < dayCount ? idx : null;
  }, [selectedDate, rangeStart, dayCount]);

  const gridWidth = dayCount * CELL_W;

  const detailTask = detailTaskId ? tasksById[detailTaskId] : null;

  type Row =
    | { type: 'section'; id: string; label: string }
    | { type: 'task'; id: string; task: Task; sectionId: string };

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    sections.forEach(s => {
      out.push({ type: 'section', id: s.id, label: s.label });
      s.taskIds.forEach(tid => {
        const t = tasksById[tid];
        if (t) out.push({ type: 'task', id: t.id, task: t, sectionId: s.id });
      });
    });
    return out;
  }, [sections, tasksById]);

  const totalWidth = LEFT_W + gridWidth;

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <div className="relative overflow-auto">
        <div style={{ width: totalWidth, minWidth: '100%' }}>
          {/* Header row */}
          <div className="grid border-b border-border" style={{ gridTemplateColumns: `${LEFT_W}px ${gridWidth}px` }}>
            <div
              className="sticky left-0 top-0 z-30 flex items-center border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 px-3 text-xs font-semibold text-muted-foreground"
              style={{ height: HEADER_H }}
            >
              Task
            </div>
            <div
              className="sticky top-0 z-20 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70"
              style={{ height: HEADER_H }}
            >
              <div className="relative" style={{ width: gridWidth, height: HEADER_H }}>
                <div className="flex">
                  {days.map((d, i) => {
                    const isToday = todayIdx !== null && i === todayIdx;
                    const isSelected = selectedIdx !== null && i === selectedIdx;
                    return (
                      <div
                        key={i}
                        className={`shrink-0 border-r border-border px-1.5 py-2 text-center ${
                          isSelected ? 'bg-primary/10' : ''
                        }`}
                        style={{ width: CELL_W, height: HEADER_H }}
                        title={format(d, 'PPP')}
                      >
                        <div className={`text-[10px] font-semibold ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                          {format(d, 'd')}
                        </div>
                        <div className="text-[9px] font-semibold text-muted-foreground/80">
                          {format(d, 'MMM')}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Today marker */}
                {todayIdx !== null && (
                  <>
                    <div
                      className="pointer-events-none absolute top-0 bottom-0 w-px bg-primary/60"
                      style={{ left: todayIdx * CELL_W + CELL_W / 2 }}
                    />
                    <div
                      className="pointer-events-none absolute top-1 left-0 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground"
                      style={{ left: todayIdx * CELL_W + CELL_W / 2 }}
                    >
                      Today
                    </div>
                  </>
                )}

                {/* Selected marker (Calendar selected date) */}
                {selectedIdx !== null && (todayIdx === null || selectedIdx !== todayIdx) && (
                  <div
                    className="pointer-events-none absolute top-0 bottom-0 w-px bg-primary/30"
                    style={{ left: selectedIdx * CELL_W + CELL_W / 2 }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Body rows */}
          <div className="divide-y divide-border">
            {rows.map(row => {
              if (row.type === 'section') {
                return (
                  <div
                    key={`section-${row.id}`}
                    className="grid"
                    style={{ gridTemplateColumns: `${LEFT_W}px ${gridWidth}px` }}
                  >
                    <div
                      className="sticky left-0 z-10 border-r border-border bg-muted/30 px-3 py-2 text-xs font-semibold text-foreground"
                      style={{ height: SECTION_H }}
                    >
                      {row.label}
                    </div>
                    <div className="relative bg-muted/15" style={{ height: SECTION_H }}>
                      {todayIdx !== null && (
                        <div
                          className="pointer-events-none absolute top-0 bottom-0 w-px bg-primary/60"
                          style={{ left: todayIdx * CELL_W + CELL_W / 2 }}
                        />
                      )}
                      {selectedIdx !== null && (todayIdx === null || selectedIdx !== todayIdx) && (
                        <div
                          className="pointer-events-none absolute top-0 bottom-0 w-px bg-primary/30"
                          style={{ left: selectedIdx * CELL_W + CELL_W / 2 }}
                        />
                      )}
                    </div>
                  </div>
                );
              }

              const t = row.task;
              const end = t.due_date ? parseDateOnly(t.due_date) : null;
              const start = t.start_date ? parseDateOnly(t.start_date) : end;

              const startIdxRaw = start ? differenceInCalendarDays(start, startOfDay(rangeStart)) : null;
              const endIdxRaw = end ? differenceInCalendarDays(end, startOfDay(rangeStart)) : null;

              const maxIdx = dayCount - 1;
              const startIdx = startIdxRaw === null ? null : clampDayIndex(startIdxRaw, maxIdx);
              const endIdx = endIdxRaw === null ? null : clampDayIndex(endIdxRaw, maxIdx);

              const barLeft = startIdx !== null ? startIdx * CELL_W : 0;
              const barRight = endIdx !== null ? endIdx * CELL_W + CELL_W : CELL_W;
              const barWidth = Math.max(CELL_W, barRight - barLeft);

              const isOutOfRange =
                (end && isBefore(end, startOfDay(rangeStart))) ||
                (start && isAfter(start, startOfDay(rangeEnd)));

              const isSelectedTask =
                !!selectedDate && !!t.due_date && isSameDay(parseISO(t.due_date), startOfDay(selectedDate));

              return (
                <div
                  key={`task-${t.id}`}
                  className={`grid ${isSelectedTask ? 'bg-primary/5' : ''}`}
                  style={{ gridTemplateColumns: `${LEFT_W}px ${gridWidth}px` }}
                >
                  <button
                    type="button"
                    onClick={() => setDetailTaskId(t.id)}
                    className="sticky left-0 z-10 h-full border-r border-border bg-background px-3 text-left text-sm font-medium text-foreground truncate hover:bg-accent/40"
                    style={{ height: ROW_H }}
                    title={t.title}
                  >
                    {t.title}
                  </button>

                  <div
                    className="relative"
                    style={{
                      width: gridWidth,
                      height: ROW_H,
                      backgroundImage: 'linear-gradient(to right, hsl(var(--border) / 0.55) 1px, transparent 1px)',
                      backgroundSize: `${CELL_W}px 100%`,
                    }}
                  >
                    {todayIdx !== null && (
                      <div
                        className="pointer-events-none absolute top-0 bottom-0 w-px bg-primary/60"
                        style={{ left: todayIdx * CELL_W + CELL_W / 2 }}
                      />
                    )}
                    {selectedIdx !== null && (todayIdx === null || selectedIdx !== todayIdx) && (
                      <div
                        className="pointer-events-none absolute top-0 bottom-0 w-px bg-primary/30"
                        style={{ left: selectedIdx * CELL_W + CELL_W / 2 }}
                      />
                    )}

                    {!isOutOfRange && endIdx !== null && (
                      <button
                        type="button"
                        onClick={() => setDetailTaskId(t.id)}
                        className={`absolute top-1/2 -translate-y-1/2 h-5 rounded-md shadow-sm ${statusToClassName[t.status]} hover:opacity-90 transition-opacity`}
                        style={{ left: barLeft + 2, width: barWidth - 4 }}
                        title={[
                          t.start_date ? `Start: ${t.start_date}` : null,
                          t.due_date ? `Due: ${t.due_date}` : null,
                        ].filter(Boolean).join('\n')}
                      >
                        <span className="sr-only">{t.title}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {detailTask && (
        <TaskDetailDialog
          task={detailTask}
          open={!!detailTaskId}
          onOpenChange={(open) => { if (!open) setDetailTaskId(null); }}
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
    </div>
  );
}

