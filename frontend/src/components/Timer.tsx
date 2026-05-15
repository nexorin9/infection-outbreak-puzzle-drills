import { useState, useEffect } from 'react';

export default function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning) {
      interval = window.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const isWarning = minutes >= 25;

  const formatTime = (m: number, s: number) => {
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const timeString = formatTime(minutes, remainingSeconds);

  return (
    <div className="flex items-center gap-4" role="timer" aria-label={`已用时间: ${timeString}`}>
      <span
        className={`text-lg font-mono font-bold ${
          isWarning ? 'text-red-500' : 'text-gray-700'
        }`}
        aria-live="polite"
      >
        {timeString}
      </span>
      <button
        onClick={() => setIsRunning(!isRunning)}
        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        aria-label={isRunning ? '暂停计时器' : '继续计时器'}
      >
        {isRunning ? '暂停' : '继续'}
      </button>
    </div>
  );
}