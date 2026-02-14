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
    <div className="fixed bottom-4 right-4 z-50 w-64 rounded-xl border border-border bg-card shadow-lg">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <p className="truncate text-xs font-medium text-foreground">{taskTitle}</p>
        <button onClick={handleClose} className="shrink-0 text-muted-foreground hover:text-foreground">
          <X size={14} />
        </button>
      </div>
      <div className="flex flex-col items-center gap-3 px-4 py-4">
        <p className="font-mono text-3xl font-bold text-foreground tabular-nums">
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </p>
        <div className="flex gap-2">
          {!running ? (
            <Button size="sm" onClick={() => setRunning(true)} className="gap-1.5">
              <Play size={14} /> Start
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={handleStop} className="gap-1.5">
              <Square size={14} /> Stop
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stopwatch;
