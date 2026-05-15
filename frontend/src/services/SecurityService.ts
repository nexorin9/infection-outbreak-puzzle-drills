/**
 * 安全工具函数
 * 输入验证、XSS防护等
 */

// XSS 防护：HTML转义
export function escapeHtml(str: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, char => escapeMap[char]);
}

// XSS 防护：移除危险标签和属性
export function sanitizeHtml(dirty: string): string {
  // Remove script tags
  let clean = dirty.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Remove event handlers
  clean = clean.replace(/\s+on\w+="[^"]*"/gi, '');
  clean = clean.replace(/\s+on\w+='[^']*'/gi, '');
  // Remove javascript: URLs
  clean = clean.replace(/javascript:/gi, '');
  // Remove data: URLs (could contain executable content)
  clean = clean.replace(/data:/gi, '');
  return clean;
}

// 输入验证：只允许字母数字下划线
export function validateAlphanumeric(input: string): boolean {
  return /^[a-zA-Z0-9_]+$/.test(input);
}

// 输入验证：UUID格式
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// 输入验证：会话ID格式
export function isValidSessionId(sessionId: string): boolean {
  // Allow UUID or short alphanumeric IDs
  return isValidUUID(sessionId) || /^[a-zA-Z0-9_-]{8,64}$/.test(sessionId);
}

// 清理用户输入（用于显示）
export function cleanUserInput(input: string): string {
  if (typeof input !== 'string') return '';
  return escapeHtml(input.trim());
}

// 速率限制：简单实现（基于时间戳）
const requestTimestamps: Map<string, number[]> = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 100; // max requests per window

export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const timestamps = requestTimestamps.get(key) || [];

  // Filter out old timestamps
  const recentTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);

  if (recentTimestamps.length >= RATE_LIMIT_MAX) {
    return false; // Rate limit exceeded
  }

  recentTimestamps.push(now);
  requestTimestamps.set(key, recentTimestamps);
  return true;
}

// 获取安全响应头配置
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  };
}

// 验证API响应格式
export function validateResponseSchema<T>(
  data: unknown,
  schema: Record<string, unknown>
): data is T {
  if (typeof data !== 'object' || data === null) return false;

  for (const key of Object.keys(schema)) {
    if (!(key in data)) {
      console.warn(`Missing expected field in response: ${key}`);
      return false;
    }
  }

  return true;
}

// 生成安全的随机ID
export function generateSecureId(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}