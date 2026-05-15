/**
 * 日志服务
 * 提供应用级日志记录
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const LOG_LEVEL_NAMES = ['DEBUG', 'INFO', 'WARN', 'ERROR'];

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: unknown;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private minLevel: LogLevel = LogLevel.INFO;

  constructor() {
    // In production, set minLevel to INFO or WARN
    if (import.meta.env.PROD) {
      this.minLevel = LogLevel.WARN;
    }
  }

  setMinLevel(level: LogLevel) {
    this.minLevel = level;
  }

  private log(level: LogLevel, category: string, message: string, data?: unknown) {
    if (level < this.minLevel) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
    };

    this.logs.push(entry);

    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console in development
    if (import.meta.env.DEV) {
      const prefix = `[${LOG_LEVEL_NAMES[level]}] [${category}]`;
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(prefix, message, data ?? '');
          break;
        case LogLevel.INFO:
          console.info(prefix, message, data ?? '');
          break;
        case LogLevel.WARN:
          console.warn(prefix, message, data ?? '');
          break;
        case LogLevel.ERROR:
          console.error(prefix, message, data ?? '');
          break;
      }
    }
  }

  debug(category: string, message: string, data?: unknown) {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  info(category: string, message: string, data?: unknown) {
    this.log(LogLevel.INFO, category, message, data);
  }

  warn(category: string, message: string, data?: unknown) {
    this.log(LogLevel.WARN, category, message, data);
  }

  error(category: string, message: string, data?: unknown) {
    this.log(LogLevel.ERROR, category, message, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Singleton instance
export const logger = new Logger();

// Logging hook for React components
import { useEffect } from 'react';

export function useLogger() {
  useEffect(() => {
    logger.info('App', 'Application mounted');
    return () => {
      logger.info('App', 'Application unmounted');
    };
  }, []);
}