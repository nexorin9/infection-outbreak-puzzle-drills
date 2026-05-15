import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReport } from '../api/client';
import type { DrillReport } from '../api/client';
import ExportButton from '../components/ExportButton';

export default function ReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<DrillReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadReport();
    }
  }, [sessionId]);

  async function loadReport() {
    if (!sessionId) return;
    try {
      const data = await getReport(sessionId);
      setReport(data);
    } catch (err) {
      setError('加载报告失败');
    } finally {
      setLoading(false);
    }
  }

  function handleRestart() {
    navigate('/');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">加载报告中...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error || '报告不存在'}</p>
      </div>
    );
  }

  const gradeColors: Record<string, string> = {
    A: 'text-green-600',
    B: 'text-blue-600',
    C: 'text-yellow-600',
    D: 'text-orange-600',
    F: 'text-red-600',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-800">推演报告</h1>
        </div>
      </div>

      {/* 内容 */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 报告头部 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">会话ID: {report.session_id}</p>
              <p className="text-sm text-gray-500">
                时间: {report.start_time} - {report.end_time}
              </p>
            </div>
            <div className="text-center">
              <p className={`text-4xl font-bold ${gradeColors[report.grade]}`}>{report.grade}</p>
              <p className="text-sm text-gray-500">等级</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-5xl font-bold text-blue-600">{report.score.toFixed(1)}</p>
            <p className="text-sm text-gray-500">总分</p>
          </div>
        </div>

        {/* 线索汇总 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">线索验证结果</h2>
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => {
              const verified = report.clues_verified.includes(`clue_${i}`);
              return (
                <div
                  key={i}
                  className={`p-4 rounded-lg text-center ${
                    verified
                      ? 'bg-green-50 border-2 border-green-300'
                      : 'bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  <span className="text-2xl">{verified ? '✓' : '✗'}</span>
                  <p className="text-sm mt-2">线索 {i + 1}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 改进建议 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">改进建议</h2>
          <ul className="space-y-2">
            {report.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <button
            onClick={handleRestart}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            重新开始推演
          </button>
          {report && <ExportButton report={report} />}
        </div>
      </div>
    </div>
  );
}