interface ProgressBarProps {
  completed: number;
  total: number;
}

export default function ProgressBar({ completed, total }: ProgressBarProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="w-full" role="progressbar" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={total} aria-label={`推演进度: ${completed} / ${total} 线索完成`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">推演进度</span>
        <span className="text-sm text-gray-500">
          {completed} / {total} 线索
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}