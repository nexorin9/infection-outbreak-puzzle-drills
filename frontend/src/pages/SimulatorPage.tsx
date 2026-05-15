import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { runSimulation } from '../api/client';
import type { SimulationResult } from '../api/client';

interface SimulatorConfig {
  timeWindowHours: number;
  thresholdMultiplier: number;
  pathogenTypes: string[];
  wardIds: string[];
  outbreakProbability: number;
}

const DEFAULT_CONFIG: SimulatorConfig = {
  timeWindowHours: 168, // 7 days
  thresholdMultiplier: 1.5,
  pathogenTypes: ['鲍曼不动杆菌', '金黄色葡萄球菌', '铜绿假单胞菌', '肺炎克雷伯菌'],
  wardIds: ['内科病房', 'ICU', '外科病房', '儿科病房'],
  outbreakProbability: 0.3,
};

export default function SimulatorPage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<SimulatorConfig>(DEFAULT_CONFIG);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRunSimulation() {
    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      // Run simulation with config (duration in hours)
      const simResult = await runSimulation(config.timeWindowHours);
      setResult(simResult);
    } catch (err) {
      setError('仿真运行失败，请稍后重试');
    } finally {
      setIsRunning(false);
    }
  }

  function handleSaveConfig() {
    localStorage.setItem('simulator_config', JSON.stringify(config));
    alert('配置已保存');
  }

  function handleLoadConfig() {
    const saved = localStorage.getItem('simulator_config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
        alert('配置已加载');
      } catch {
        alert('配置加载失败');
      }
    }
  }

  function handleResetConfig() {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem('simulator_config');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">数据模拟器配置</h1>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：配置表单 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">仿真参数</h2>

            <div className="space-y-4">
              {/* 时间窗口 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  时间窗口（小时）
                </label>
                <input
                  type="number"
                  value={config.timeWindowHours}
                  onChange={(e) => setConfig({ ...config, timeWindowHours: parseInt(e.target.value) || 168 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="24"
                  max="720"
                />
                <p className="text-xs text-gray-500 mt-1">范围：24-720小时（1-30天）</p>
              </div>

              {/* 阈值倍数 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  暴发阈值倍数
                </label>
                <input
                  type="number"
                  value={config.thresholdMultiplier}
                  onChange={(e) => setConfig({ ...config, thresholdMultiplier: parseFloat(e.target.value) || 1.5 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="3"
                  step="0.1"
                />
                <p className="text-xs text-gray-500 mt-1">基准值的倍数，超过则触发预警</p>
              </div>

              {/* 暴发概率 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  暴发生成概率
                </label>
                <input
                  type="range"
                  value={config.outbreakProbability * 100}
                  onChange={(e) => setConfig({ ...config, outbreakProbability: parseInt(e.target.value) / 100 })}
                  className="w-full"
                  min="0"
                  max="100"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>{(config.outbreakProbability * 100).toFixed(0)}%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* 病区选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  参与的病区
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {config.wardIds.map((ward) => (
                    <label key={ward} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.wardIds.includes(ward)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig({ ...config, wardIds: [...config.wardIds, ward] });
                          } else {
                            setConfig({ ...config, wardIds: config.wardIds.filter(w => w !== ward) });
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{ward}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 病原菌类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  病原菌类型
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {config.pathogenTypes.map((pathogen) => (
                    <label key={pathogen} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.pathogenTypes.includes(pathogen)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig({ ...config, pathogenTypes: [...config.pathogenTypes, pathogen] });
                          } else {
                            setConfig({ ...config, pathogenTypes: config.pathogenTypes.filter(p => p !== pathogen) });
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{pathogen}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={handleRunSimulation}
                disabled={isRunning}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
              >
                {isRunning ? '运行中...' : '运行仿真'}
              </button>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleSaveConfig}
                  className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm"
                >
                  保存配置
                </button>
                <button
                  onClick={handleLoadConfig}
                  className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg text-sm"
                >
                  加载配置
                </button>
                <button
                  onClick={handleResetConfig}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
                >
                  重置
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* 右侧：仿真结果 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">仿真结果</h2>

            {!result ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                {isRunning ? '仿真运行中...' : '点击「运行仿真」查看结果'}
              </div>
            ) : (
              <div className="space-y-4">
                {/* 预警统计 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{result.alerts.filter(a => a.triggered).length}</p>
                    <p className="text-sm text-gray-500">触发的预警</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">{result.clues.length}</p>
                    <p className="text-sm text-gray-500">生成的线索</p>
                  </div>
                </div>

                {/* 预警详情 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">预警详情</h3>
                  <div className="space-y-2">
                    {result.alerts.map((alert, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          alert.triggered ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">{alert.rule_name}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            alert.triggered ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {alert.triggered ? '触发' : '未触发'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">规则ID: {alert.rule_id}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setResult(null)}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
                  >
                    清除结果
                  </button>
                  <button
                    onClick={() => {
                      // Export simulation result
                      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `simulation_${Date.now()}.json`;
                      a.click();
                    }}
                    className="flex-1 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm"
                  >
                    导出 JSON
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}