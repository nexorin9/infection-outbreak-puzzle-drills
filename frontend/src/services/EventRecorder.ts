/**
 * 事件记录器 - 记录推演过程中的用户操作
 */
import { PuzzleState, PuzzleAction } from '../contexts/PuzzleContext';

export interface RecordedEvent {
  id: string;
  timestamp: number;
  type: 'ACTION' | 'STATE_CHANGE' | 'CHECKPOINT' | 'HINT';
  action?: PuzzleAction;
  stateSnapshot?: PuzzleState;
  description: string;
}

export class EventRecorder {
  private events: RecordedEvent[] = [];
  private startTime: number;
  private sessionId: string | null = null;

  constructor() {
    this.events = [];
    this.startTime = Date.now();
  }

  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  recordAction(action: PuzzleAction, description: string): void {
    const event: RecordedEvent = {
      id: this.generateId(),
      timestamp: Date.now() - this.startTime,
      type: 'ACTION',
      action,
      description,
    };
    this.events.push(event);
  }

  recordStateChange(state: PuzzleState, description: string): void {
    const event: RecordedEvent = {
      id: this.generateId(),
      timestamp: Date.now() - this.startTime,
      type: 'STATE_CHANGE',
      stateSnapshot: { ...state },
      description,
    };
    this.events.push(event);
  }

  recordCheckpoint(clueId: string, correct: boolean, scoreDelta: number): void {
    const event: RecordedEvent = {
      id: this.generateId(),
      timestamp: Date.now() - this.startTime,
      type: 'CHECKPOINT',
      description: `检查点 ${clueId}: ${correct ? '正确' : '错误'}, 分数变化: ${scoreDelta}`,
    };
    this.events.push(event);
  }

  recordHintUsed(clueId: string): void {
    const event: RecordedEvent = {
      id: this.generateId(),
      timestamp: Date.now() - this.startTime,
      type: 'HINT',
      description: `使用提示: ${clueId}`,
    };
    this.events.push(event);
  }

  getEvents(): RecordedEvent[] {
    return [...this.events];
  }

  getDuration(): number {
    return Date.now() - this.startTime;
  }

  exportToJSON(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      startTime: this.startTime,
      duration: this.getDuration(),
      events: this.events,
    }, null, 2);
  }

  importFromJSON(jsonString: string): void {
    try {
      const data = JSON.parse(jsonString);
      this.sessionId = data.sessionId;
      this.startTime = data.startTime;
      this.events = data.events;
    } catch (e) {
      throw new Error('无效的回放数据格式');
    }
  }

  private generateId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 单例实例
let recorderInstance: EventRecorder | null = null;

export function getRecorder(): EventRecorder {
  if (!recorderInstance) {
    recorderInstance = new EventRecorder();
  }
  return recorderInstance;
}

export function resetRecorder(): void {
  recorderInstance = new EventRecorder();
}

// localStorage keys
const REPLAY_KEY = 'infection_outbreak_replay';
const REPLAY_LIST_KEY = 'infection_outbreak_replay_list';

export interface ReplayMetadata {
  id: string;
  sessionId: string;
  date: string;
  duration: number;
  eventCount: number;
  finalScore: number;
}

export function saveReplay(recorder: EventRecorder, finalScore: number): string {
  const replayData = recorder.exportToJSON();
  const replayId = `replay_${Date.now()}`;

  const metadata: ReplayMetadata = {
    id: replayId,
    sessionId: JSON.parse(replayData).sessionId || 'unknown',
    date: new Date().toISOString(),
    duration: recorder.getDuration(),
    eventCount: recorder.getEvents().length,
    finalScore,
  };

  // 保存回放数据
  localStorage.setItem(`${REPLAY_KEY}_${replayId}`, replayData);

  // 更新回放列表
  const list = getReplayList();
  list.unshift(metadata);
  localStorage.setItem(REPLAY_LIST_KEY, JSON.stringify(list.slice(0, 20))); // 最多保存20条

  return replayId;
}

export function getReplayList(): ReplayMetadata[] {
  const listStr = localStorage.getItem(REPLAY_LIST_KEY);
  if (!listStr) return [];
  try {
    return JSON.parse(listStr);
  } catch {
    return [];
  }
}

export function getReplay(replayId: string): RecordedEvent[] | null {
  const data = localStorage.getItem(`${REPLAY_KEY}_${replayId}`);
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    return parsed.events;
  } catch {
    return null;
  }
}

export function deleteReplay(replayId: string): void {
  localStorage.removeItem(`${REPLAY_KEY}_${replayId}`);
  const list = getReplayList().filter(m => m.id !== replayId);
  localStorage.setItem(REPLAY_LIST_KEY, JSON.stringify(list));
}

export function clearAllReplays(): void {
  const list = getReplayList();
  list.forEach(m => localStorage.removeItem(`${REPLAY_KEY}_${m.id}`));
  localStorage.removeItem(REPLAY_LIST_KEY);
}