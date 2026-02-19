import { useState, useEffect, useRef } from 'react';
import { X, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  taskTitle: string;
  initialSeconds: number;
  onStop: (totalSeconds: number) => void;
  onClose: () => void;
};

const Stopwatch = ({ taskTitle, initialSeconds, onStop, onClose }: Props) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const handleStop = () => {
    setRunning(false);
    onStop(seconds);
  };

  const handleClose = () => {
    if (running) handleStop();
    onClose();
  };

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 rounded-2xl border border-border bg-card shadow-xl overflow-hidden transition-card">
      {/* Colored header */}
      <div className="bg-[hsl(var(--timer-active))] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {running && <span className="h-2 w-2 rounded-full bg-white animate-pulse-dot shrink-0" />}
          <p className="truncate text-xs font-semibold text-white">{taskTitle}</p>
        </div>
        <button onClick={handleClose} className="shrink-0 text-white/70 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>
      <div className="flex flex-col items-center gap-4 px-4 py-5">
        <p className="font-mono text-4xl font-bold text-foreground tabular-nums tracking-tight">
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </p>
        <div className="flex gap-2">
          {!running ? (
            <Button size="sm" onClick={() => setRunning(true)} className="gap-1.5 rounded-lg px-5">
              <Play size={14} /> Start
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={handleStop} className="gap-1.5 rounded-lg px-5">
              <Square size={14} /> Stop
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stopwatch;
