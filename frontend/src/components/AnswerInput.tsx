import { useState } from 'react';
import { sanitizeHtml } from '../services/SecurityService';

interface AnswerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export default function AnswerInput({ value, onChange, onSubmit, disabled }: AnswerInputProps) {
  const [showTips, setShowTips] = useState(false);

  const tips = [
    '检查床位流转数据中同一病区的患者',
    '注意微生物培养结果的阳性时间',
    '关注抗菌药物使用强度变化',
    '器械相关感染需要查看 device_type 字段',
  ];

  function handleKeyDown(e: React.KeyboardEvent) {
    // Ctrl+Enter to submit
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSubmit();
      }
    }
  }

  // Sanitize input before passing to onChange (XSS防护)
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const sanitized = sanitizeHtml(e.target.value);
    onChange(sanitized);
  }

  return (
    <div>
      <label htmlFor="answer-input" className="block text-sm font-medium text-gray-700 mb-2">
        请输入你的答案（关键词）：
      </label>
      <textarea
        id="answer-input"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="请输入你的答案（关键词）："
        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        rows={4}
        aria-describedby="answer-tips"
      />
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
          aria-label="提交答案"
        >
          {disabled ? '提交中...' : '提交答案'}
        </button>
        <button
          onClick={() => setShowTips(!showTips)}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          aria-expanded={showTips}
          aria-controls="answer-tips"
        >
          {showTips ? '隐藏提示' : '显示答题技巧'}
        </button>
      </div>
      {showTips && (
        <div id="answer-tips" className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg" role="region" aria-label="答题技巧">
          <h4 className="font-medium text-gray-700 mb-2">答题技巧：</h4>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-2 text-xs text-gray-500">
        提示：按 Ctrl+Enter 快速提交
      </p>
    </div>
  );
}