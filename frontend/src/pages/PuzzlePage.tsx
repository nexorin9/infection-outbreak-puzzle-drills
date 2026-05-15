import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePuzzle } from '../contexts/PuzzleContext';
import { useReplay } from '../contexts/ReplayContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { showToast } from '../components/ToastProvider';
import { getCurrentClue, verifyCheckpoint } from '../api/client';
import type { Clue, VerificationResult } from '../api/client';
import ProgressBar from '../components/ProgressBar';
import Timer from '../components/Timer';
import ClueList from '../components/ClueList';
import ClueDetail from '../components/ClueDetail';
import DataCheckpoint from '../components/DataCheckpoint';
import AnswerInput from '../components/AnswerInput';

export default function PuzzlePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = usePuzzle();
  const { startRecording, stopRecording } = useReplay();
  const [showHelp, setShowHelp] = useState(false);

  const [currentClue, setCurrentClue] = useState<Clue | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSave: () => {
      // Save progress - could persist to localStorage
      console.log('Save progress shortcut triggered');
    },
    onHelp: () => {
      setShowHelp(!showHelp);
    },
    onNew: () => {
      navigate('/');
    },
    onEscape: () => {
      setShowHelp(false);
    },
  });

  useEffect(() => {
    if (sessionId) {
      loadCurrentClue();
      startRecording(sessionId);
    }
  }, [sessionId, startRecording]);

  useEffect(() => {
    // Cleanup: stop recording when puzzle completes or fails
    if (state.status === 'completed' || state.status === 'failed') {
      stopRecording();
    }
  }, [state.status, stopRecording]);

  async function loadCurrentClue() {
    if (!sessionId) return;
    try {
      const clue = await getCurrentClue(sessionId);
      setCurrentClue(clue);
    } catch (err) {
      setError('加载线索失败');
      showToast.error('请检查网络连接', '加载线索失败');
    }
  }

  async function handleSubmit() {
    if (!sessionId || !currentClue || !answer.trim()) return;

    setLoading(true);
    setFeedback(null);

    try {
      const result: VerificationResult = await verifyCheckpoint(
        sessionId,
        currentClue.clue_id,
        answer
      );

      if (result.correct) {
        dispatch({
          type: 'VERIFY_ANSWER',
          payload: {
            correct: true,
            scoreDelta: result.score_delta,
            nextClueId: result.next_clue_id,
          },
        });

        showToast.success('答案正确！', '验证成功');

        if (result.next_clue_id) {
          setFeedback(result.message);
          setAnswer('');
          await loadCurrentClue();
        } else {
          dispatch({ type: 'COMPLETE', payload: { finalScore: state.score + result.score_delta } });
          showToast.success('恭喜完成推演！', '推演完成');
          navigate(`/report/${sessionId}`);
        }
      } else {
        showToast.error('请重新检查数据', '答案错误');
        setFeedback(result.message);
      }
    } catch (err) {
      setError('验证失败');
    } finally {
      setLoading(false);
    }
  }

  function handleUseHint() {
    if (currentClue) {
      dispatch({ type: 'USE_HINT' });
      setFeedback(currentClue.hint);
    }
  }

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">会话ID不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部进度条和计时器 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800">院感暴发线索链推演</h1>
            <Timer />
          </div>
          <ProgressBar completed={state.completedClues.length} total={5} />
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：线索列表 */}
          <div className="lg:col-span-1">
            <ClueList
              completedClues={state.completedClues}
              currentIndex={state.currentClueIndex}
            />
          </div>

          {/* 中间：当前线索详情 */}
          <div className="lg:col-span-1">
            {currentClue && (
              <ClueDetail
                clue={currentClue}
                onUseHint={handleUseHint}
              />
            )}
          </div>

          {/* 右侧：数据检查点 */}
          <div className="lg:col-span-1">
            <DataCheckpoint checkpoints={currentClue?.data_checkpoints || []} />
          </div>
        </div>

        {/* 答案输入区 */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">提交答案</h2>
          <AnswerInput
            value={answer}
            onChange={setAnswer}
            onSubmit={handleSubmit}
            disabled={loading}
          />
          {feedback && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">{feedback}</p>
            </div>
          )}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* 快捷键帮助弹窗 */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
            <h2 className="text-xl font-bold mb-4">键盘快捷键</h2>
            <ul className="space-y-2">
              <li><kbd className="px-2 py-1 bg-gray-200 rounded text-sm">Ctrl+S</kbd> 保存进度</li>
              <li><kbd className="px-2 py-1 bg-gray-200 rounded text-sm">Ctrl+H</kbd> 显示帮助</li>
              <li><kbd className="px-2 py-1 bg-gray-200 rounded text-sm">Ctrl+N</kbd> 新建推演</li>
              <li><kbd className="px-2 py-1 bg-gray-200 rounded text-sm">Esc</kbd> 关闭弹窗</li>
            </ul>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}