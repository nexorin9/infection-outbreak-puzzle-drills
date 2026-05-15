import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReplay } from '../contexts/ReplayContext';
import { RecordedEvent } from '../services/EventRecorder';

export default function ReplayPage() {
  const { replayId } = useParams<{ replayId: string }>();
  const navigate = useNavigate();
  const {
    state,
    play,
    pause,
    resume,
    stop,
    setSpeed,
    seekTo,
    getCurrentEvent,
  } = useReplay();

  const [currentEvent, setCurrentEvent] = useState<RecordedEvent | null>(null);

  useEffect(() => {
    if (replayId) {
      // Start replay will be handled when user clicks play
    }
  }, [replayId]);

  useEffect(() => {
    const event = getCurrentEvent();
    setCurrentEvent(event);
  }, [state.currentEventIndex, getCurrentEvent]);

  function handleBack() {
    stop();
    navigate('/');
  }

  function handleSeekTo(eventIndex: number) {
    seekTo(eventIndex);
  }

  const speedOptions = [0.5, 1, 1.5, 2, 4];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">推演回放</h1>
            <p className="text-sm text-gray-500">回放ID: {replayId}</p>
          </div>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>

      {/* 播放控制区 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* 进度条 */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>{state.currentEventIndex + 1} / {state.events.length}</span>
              <span>{((state.currentEventIndex + 1) / state.events.length * 100).toFixed(0)}%</span>
            </div>
            <div
              className="h-3 bg-gray-200 rounded-full cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                const targetIndex = Math.floor(percent * state.events.length);
                handleSeekTo(targetIndex);
              }}
            >
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${((state.currentEventIndex + 1) / state.events.length) * 100}%` }}
              />
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => handleSeekTo(Math.max(0, state.currentEventIndex - 10))}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              title="后退10步"
            >
              -10
            </button>
            <button
              onClick={() => handleSeekTo(Math.max(0, state.currentEventIndex - 1))}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              title="后退1步"
            >
              -1
            </button>

            {state.isReplaying && state.isPaused ? (
              <button
                onClick={resume}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                继续
              </button>
            ) : state.isReplaying ? (
              <button
                onClick={pause}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium"
              >
                暂停
              </button>
            ) : (
              <button
                onClick={play}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
              >
                播放
              </button>
            )}

            <button
              onClick={() => handleSeekTo(Math.min(state.events.length - 1, state.currentEventIndex + 1))}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              title="前进1步"
            >
              +1
            </button>
            <button
              onClick={() => handleSeekTo(Math.min(state.events.length - 1, state.currentEventIndex + 10))}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              title="前进10步"
            >
              +10
            </button>

            <button
              onClick={stop}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg"
            >
              停止
            </button>
          </div>

          {/* 速度控制 */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-500">播放速度:</span>
            {speedOptions.map((speed) => (
              <button
                key={speed}
                onClick={() => setSpeed(speed)}
                className={`px-3 py-1 rounded ${
                  state.playbackSpeed === speed
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* 当前事件详情 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">当前事件</h2>
          {currentEvent ? (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  currentEvent.type === 'ACTION' ? 'bg-blue-100 text-blue-700' :
                  currentEvent.type === 'STATE_CHANGE' ? 'bg-green-100 text-green-700' :
                  currentEvent.type === 'CHECKPOINT' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {currentEvent.type}
                </span>
                <span className="text-sm text-gray-500">
                  时间: {(currentEvent.timestamp / 1000).toFixed(1)}秒
                </span>
              </div>
              <p className="text-gray-700">{currentEvent.description}</p>
              {currentEvent.action && (
                <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono">
                  <p className="text-gray-500">动作类型: {currentEvent.action.type}</p>
                  {'payload' in currentEvent.action && currentEvent.action.payload && (
                    <pre className="mt-1 text-gray-700 overflow-auto">
                      {JSON.stringify(currentEvent.action.payload, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">暂无事件数据</p>
          )}
        </div>

        {/* 事件列表 */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">事件列表</h2>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">#</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">时间</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">类型</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">描述</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {state.events.map((event, index) => (
                  <tr
                    key={event.id}
                    className={`border-t border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      index === state.currentEventIndex ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleSeekTo(index)}
                  >
                    <td className="py-2 px-3 text-sm text-gray-500">{index + 1}</td>
                    <td className="py-2 px-3 text-sm text-gray-500">
                      {(event.timestamp / 1000).toFixed(1)}秒
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.type === 'ACTION' ? 'bg-blue-100 text-blue-700' :
                        event.type === 'STATE_CHANGE' ? 'bg-green-100 text-green-700' :
                        event.type === 'CHECKPOINT' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {event.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-700 truncate max-w-xs">
                      {event.description}
                    </td>
                    <td className="py-2 px-3">
                      {index === state.currentEventIndex ? (
                        <span className="text-blue-600 text-sm">当前</span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSeekTo(index);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          跳转
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}