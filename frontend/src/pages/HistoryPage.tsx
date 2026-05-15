import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HistoryService, DrillHistoryRecord } from '../services/HistoryService';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<DrillHistoryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecords, setFilteredRecords] = useState<DrillHistoryRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<DrillHistoryRecord | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredRecords(HistoryService.search(searchQuery));
    } else {
      setFilteredRecords(records);
    }
  }, [searchQuery, records]);

  function loadRecords() {
    const data = HistoryService.getAll();
    setRecords(data);
    setFilteredRecords(data);
  }

  function handleDelete(id: string) {
    if (confirm('确定要删除这条记录吗？')) {
      HistoryService.delete(id);
      loadRecords();
      if (selectedRecord?.id === id) {
        setSelectedRecord(null);
      }
    }
  }

  function handleClearAll() {
    if (confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
      HistoryService.clear();
      loadRecords();
      setSelectedRecord(null);
    }
  }

  function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  }

  function getGradeColor(grade: string): string {
    const colors: Record<string, string> = {
      A: 'text-green-600 bg-green-50',
      B: 'text-blue-600 bg-blue-50',
      C: 'text-yellow-600 bg-yellow-50',
      D: 'text-orange-600 bg-orange-50',
      F: 'text-red-600 bg-red-50',
    };
    return colors[grade] || 'text-gray-600 bg-gray-50';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">推演历史</h1>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>

      {/* 搜索和操作栏 */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4">
          <input
            type="text"
            placeholder="搜索会话ID、等级或状态..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg"
            disabled={records.length === 0}
          >
            清空全部
          </button>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{records.length}</p>
            <p className="text-sm text-gray-500">总推演次数</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {records.length > 0 ? (records.reduce((sum, r) => sum + r.score, 0) / records.length).toFixed(1) : 0}
            </p>
            <p className="text-sm text-gray-500">平均分数</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {records.filter(r => r.status === 'completed').length}
            </p>
            <p className="text-sm text-gray-500">完成次数</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {records.length > 0 ? Math.round(records.reduce((sum, r) => sum + r.duration, 0) / records.length / 60000) : 0}分钟
            </p>
            <p className="text-sm text-gray-500">平均时长</p>
          </div>
        </div>
      </div>

      {/* 历史列表 */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? '没有找到匹配的历史记录' : '暂无历史记录'}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">日期</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">会话ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">等级</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">分数</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">时长</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">线索</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-700">{record.date}</td>
                    <td className="py-3 px-4 text-sm text-gray-500 font-mono">{record.sessionId.slice(0, 8)}...</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getGradeColor(record.grade)}`}>
                        {record.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{record.score.toFixed(1)}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{formatDuration(record.duration)}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{record.cluesCompleted}/{record.totalClues}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        record.status === 'completed' ? 'bg-green-100 text-green-700' :
                        record.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {record.status === 'completed' ? '已完成' : record.status === 'failed' ? '失败' : '已放弃'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="px-2 py-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          详情
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="px-2 py-1 text-red-600 hover:text-red-800 text-sm"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 详情弹窗 */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
            <h2 className="text-xl font-bold mb-4">历史详情</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">会话ID:</span>
                <span className="text-gray-700 font-mono text-sm">{selectedRecord.sessionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">日期:</span>
                <span className="text-gray-700">{selectedRecord.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">等级:</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${getGradeColor(selectedRecord.grade)}`}>
                  {selectedRecord.grade}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">分数:</span>
                <span className="text-gray-700">{selectedRecord.score.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">时长:</span>
                <span className="text-gray-700">{formatDuration(selectedRecord.duration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">完成线索:</span>
                <span className="text-gray-700">{selectedRecord.cluesCompleted}/{selectedRecord.totalClues}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">使用提示:</span>
                <span className="text-gray-700">{selectedRecord.hintsUsed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">状态:</span>
                <span className="text-gray-700">
                  {selectedRecord.status === 'completed' ? '已完成' : selectedRecord.status === 'failed' ? '失败' : '已放弃'}
                </span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate(`/report/${selectedRecord.sessionId}`)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                查看报告
              </button>
              <button
                onClick={() => setSelectedRecord(null)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}