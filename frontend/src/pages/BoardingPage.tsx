import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function BoardingPage() {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);

  function handleStart() {
    navigate('/');
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex flex-col items-center justify-center p-8">
      {/* 标题区 */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">
          院感暴发桌面线索链推演系统
        </h1>
        <p className="text-xl text-blue-200">
          Infection-Outbreak-Puzzle-Drills
        </p>
      </div>

      {/* 统计数字 */}
      <div className="grid grid-cols-3 gap-8 mb-12">
        <div className="bg-white/10 backdrop-blur rounded-xl p-8 text-center">
          <p className="text-5xl font-bold text-white mb-2">5</p>
          <p className="text-blue-200">规则数量</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-xl p-8 text-center">
          <p className="text-5xl font-bold text-white mb-2">50</p>
          <p className="text-blue-200">样例患者</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-xl p-8 text-center">
          <p className="text-5xl font-bold text-white mb-2">100</p>
          <p className="text-blue-200">抗菌药物医嘱</p>
        </div>
      </div>

      {/* 开始按钮 */}
      <button
        onClick={handleStart}
        className="px-12 py-6 bg-blue-500 hover:bg-blue-600 text-white text-2xl font-bold rounded-xl transition-colors shadow-lg"
      >
        开始推演
      </button>

      {/* 全屏按钮 */}
      <button
        onClick={toggleFullscreen}
        className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
      >
        {isFullscreen ? '退出全屏' : '全屏显示'}
      </button>

      {/* 二维码占位 */}
      <div className="mt-12 text-center">
        <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
          <span className="text-gray-400">二维码</span>
        </div>
        <p className="text-blue-200 text-sm">扫码开始推演</p>
      </div>
    </div>
  );
}