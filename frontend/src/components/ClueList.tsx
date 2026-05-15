interface ClueListProps {
  completedClues: string[];
  currentIndex: number;
}

const clueNames = ['Rule 001', 'Rule 002', 'Rule 003', 'Rule 004', 'Rule 005'];

export default function ClueList({ completedClues, currentIndex }: ClueListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">线索链</h2>
      <ul className="space-y-2" role="list" aria-label="线索列表">
        {clueNames.map((name, index) => {
          const isCompleted = completedClues.includes(`clue_${index}`);
          const isCurrent = index === currentIndex && !isCompleted;

          return (
            <li
              key={name}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                isCompleted
                  ? 'bg-green-50 border border-green-200'
                  : isCurrent
                  ? 'bg-blue-50 border border-blue-300 ring-2 ring-blue-400'
                  : 'bg-gray-50 border border-gray-200'
              }`}
              role="listitem"
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`${name}, ${isCompleted ? '已完成' : isCurrent ? '当前步骤' : '未完成'}`}
            >
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
                aria-hidden="true"
              >
                {isCompleted ? '✓' : index + 1}
              </span>
              <span
                className={`font-medium ${
                  isCompleted
                    ? 'text-green-700'
                    : isCurrent
                    ? 'text-blue-700'
                    : 'text-gray-500'
                }`}
              >
                {name}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}