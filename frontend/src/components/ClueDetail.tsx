import type { Clue } from '../api/client';

interface ClueDetailProps {
  clue: Clue;
  onUseHint: () => void;
}

export default function ClueDetail({ clue, onUseHint }: ClueDetailProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">当前线索</h2>
        <button
          onClick={onUseHint}
          className="px-3 py-1 text-sm bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-md border border-yellow-200 transition-colors"
        >
          使用提示
        </button>
      </div>
      <div className="prose prose-sm max-w-none">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <pre className="whitespace-pre-wrap text-sm text-blue-800 font-sans">
            {clue.description}
          </pre>
        </div>
      </div>
    </div>
  );
}