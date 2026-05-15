/**
 * 历史记录服务
 * 管理推演历史数据
 */
import type { ReplayMetadata } from './EventRecorder';

export interface DrillHistoryRecord {
  id: string;
  sessionId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in milliseconds
  score: number;
  grade: string;
  cluesCompleted: number;
  totalClues: number;
  hintsUsed: number;
  status: 'completed' | 'failed' | 'abandoned';
}

const HISTORY_KEY = 'infection_outbreak_drill_history';
const MAX_HISTORY_RECORDS = 100;

export class HistoryService {
  /**
   * 获取所有历史记录
   */
  static getAll(): DrillHistoryRecord[] {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * 保存历史记录
   */
  static save(record: DrillHistoryRecord): void {
    const records = this.getAll();
    records.unshift(record); // newest first

    // Limit max records
    const trimmed = records.slice(0, MAX_HISTORY_RECORDS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  }

  /**
   * 根据ID获取单条记录
   */
  static getById(id: string): DrillHistoryRecord | null {
    const records = this.getAll();
    return records.find(r => r.id === id) || null;
  }

  /**
   * 删除记录
   */
  static delete(id: string): void {
    const records = this.getAll().filter(r => r.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(records));
  }

  /**
   * 清空所有历史
   */
  static clear(): void {
    localStorage.removeItem(HISTORY_KEY);
  }

  /**
   * 搜索历史记录
   */
  static search(query: string): DrillHistoryRecord[] {
    const records = this.getAll();
    const lowerQuery = query.toLowerCase();
    return records.filter(r =>
      r.sessionId.toLowerCase().includes(lowerQuery) ||
      r.grade.toLowerCase().includes(lowerQuery) ||
      r.status.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * 获取统计数据
   */
  static getStats(): {
    totalDrills: number;
    avgScore: number;
    avgDuration: number;
    completedCount: number;
    failedCount: number;
  } {
    const records = this.getAll();
    if (records.length === 0) {
      return {
        totalDrills: 0,
        avgScore: 0,
        avgDuration: 0,
        completedCount: 0,
        failedCount: 0,
      };
    }

    const completed = records.filter(r => r.status === 'completed');
    const totalScore = records.reduce((sum, r) => sum + r.score, 0);
    const totalDuration = records.reduce((sum, r) => sum + r.duration, 0);

    return {
      totalDrills: records.length,
      avgScore: totalScore / records.length,
      avgDuration: totalDuration / records.length,
      completedCount: completed.length,
      failedCount: records.length - completed.length,
    };
  }

  /**
   * 从 replay 迁移数据（如果需要）
   */
  static migrateFromReplays(replays: ReplayMetadata[]): void {
    const existing = this.getAll();
    const existingSessionIds = new Set(existing.map(r => r.sessionId));

    replays.forEach(replay => {
      if (!existingSessionIds.has(replay.sessionId)) {
        const record: DrillHistoryRecord = {
          id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sessionId: replay.sessionId,
          date: replay.date,
          startTime: replay.date,
          endTime: replay.date,
          duration: replay.duration,
          score: replay.finalScore,
          grade: replay.finalScore >= 80 ? 'A' : replay.finalScore >= 60 ? 'B' : replay.finalScore >= 40 ? 'C' : 'D',
          cluesCompleted: 0, // unknown from replay
          totalClues: 5,
          hintsUsed: 0,
          status: 'completed',
        };
        existing.push(record);
      }
    });

    existing.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    localStorage.setItem(HISTORY_KEY, JSON.stringify(existing.slice(0, MAX_HISTORY_RECORDS)));
  }
}

export default HistoryService;