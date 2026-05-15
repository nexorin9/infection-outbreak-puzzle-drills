import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useReplay } from '../contexts/ReplayContext';
import { startPuzzle } from '../api/client';

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { replayList, startReplay } = useReplay();

  async function handleStartNew() {
    setLoading(true);
    try {
      const session = await startPuzzle();
      navigate(`/puzzle/${session.session_id}`);
    } catch (err) {
      setLoading(false);
    }
  }

  function handleViewReplay(replayId: string) {
    startReplay(replayId);
    navigate(`/replay/${replayId}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t('app.title')}
            </h1>
            <p className="text-gray-500 mt-1">
              Infection-Outbreak-Puzzle-Drills
            </p>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：项目介绍 */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('help.introduction')}</h2>
            <p className="text-gray-600 mb-4">
              {t('home.description')}
            </p>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">{t('puzzle.startTitle')}：</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>{t('home.statistics.totalDrills')}</li>
                <li>{t('home.statistics.avgScore')}</li>
                <li>{t('home.statistics.totalRules')}</li>
              </ul>
            </div>
            <div className="mt-6">
              <h3 className="font-semibold text-gray-700 mb-2">技术栈：</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Python</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">SimPy</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">FastAPI</span>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">React</span>
                <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm">TypeScript</span>
              </div>
            </div>
          </div>

          {/* 右侧：快速开始 */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('home.quickStart')}</h2>
            <div className="space-y-4">
              <button
                onClick={handleStartNew}
                disabled={loading}
                className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors text-lg"
              >
                {loading ? t('common.loading') : t('home.quickStart')}
              </button>
              <button
                onClick={() => navigate('/help')}
                className="w-full px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                {t('nav.help')}
              </button>
            </div>

            {/* 最近回放 */}
            {replayList.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-gray-700 mb-3">最近回放</h3>
                <div className="space-y-2">
                  {replayList.slice(0, 5).map((replay) => (
                    <div
                      key={replay.id}
                      className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm text-gray-500">{replay.date}</p>
                        <p className="text-sm text-gray-700">
                          {replay.eventCount} events, Score: {replay.finalScore}
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewReplay(replay.id)}
                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm"
                      >
                        回放
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <h3 className="font-semibold text-gray-700 mb-3">{t('home.rulesReference')}</h3>
              <div className="space-y-2 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-700">Rule 001: 同病区同病原菌聚集</p>
                  <p className="text-gray-500">3天内2例相同病原菌 = 疑似暴发</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-700">Rule 002: 抗菌药物使用强度异常</p>
                  <p className="text-gray-500">DDD 超出基准值30%</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-700">Rule 003: 微生物培养阳性率骤升</p>
                  <p className="text-gray-500">超出历史均值2个标准差</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-700">Rule 004: 器械相关感染聚集</p>
                  <p className="text-gray-500">CLABSI/CAUTI/VAP 发生率上升</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-700">Rule 005: 暴发确认与报告</p>
                  <p className="text-gray-500">综合分析，确认暴发并生成报告</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部统计数据 */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">5</p>
            <p className="text-gray-500">{t('home.statistics.totalRules')}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-green-600">50</p>
            <p className="text-gray-500">{t('home.statistics.totalDrills')}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-purple-600">100</p>
            <p className="text-gray-500">{t('home.statistics.avgScore')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}