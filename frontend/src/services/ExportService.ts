/**
 * 数据导出服务
 * 支持 JSON、CSV、PDF、Excel 格式导出
 */
import type { DrillReport, SimulationResult } from '../api/client';
import type { ReplayMetadata } from './EventRecorder';

// JSON 导出
export function exportToJSON<T>(data: T, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, filename);
}

// CSV 导出
export function exportToCSV<T extends Record<string, unknown>>(data: T[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h];
        const str = val === null || val === undefined ? '' : String(val);
        // Escape quotes and wrap in quotes if contains comma or quote
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

// 从报告生成 CSV 格式数据
export function reportToCSVData(report: DrillReport): Array<Record<string, unknown>> {
  const rows: Array<Record<string, unknown>> = [];

  // 基本信息
  rows.push({
    type: 'header',
    session_id: report.session_id,
    start_time: report.start_time,
    end_time: report.end_time,
    score: report.score,
    grade: report.grade,
  });

  // 线索验证结果
  report.clues_verified.forEach((clueId, index) => {
    rows.push({
      type: 'clue',
      index: index + 1,
      clue_id: clueId,
      verified: true,
    });
  });

  // 时间线事件
  report.timeline_summary.forEach((event, index) => {
    rows.push({
      type: 'timeline',
      index: index + 1,
      time: event.time,
      event_type: event.event_type,
      description: event.description,
    });
  });

  // 改进建议
  report.recommendations.forEach((rec, index) => {
    rows.push({
      type: 'recommendation',
      index: index + 1,
      recommendation: rec,
    });
  });

  return rows;
}

// PDF 导出（使用 jsPDF）
export async function exportToPDF(report: DrillReport, filename: string): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  // 标题
  doc.setFontSize(20);
  doc.text('院感暴发推演报告', 20, 20);

  // 基本信息
  doc.setFontSize(12);
  doc.text(`会话ID: ${report.session_id}`, 20, 40);
  doc.text(`时间: ${report.start_time} - ${report.end_time}`, 20, 50);
  doc.text(`等级: ${report.grade}`, 20, 60);
  doc.text(`总分: ${report.score.toFixed(1)}`, 20, 70);

  // 线索验证结果
  doc.setFontSize(14);
  doc.text('线索验证结果', 20, 90);
  doc.setFontSize(10);
  report.clues_verified.forEach((clueId, index) => {
    doc.text(`${index + 1}. ${clueId}`, 25, 100 + index * 10);
  });

  // 改进建议
  const yPos = 100 + report.clues_verified.length * 10 + 20;
  doc.setFontSize(14);
  doc.text('改进建议', 20, yPos);
  doc.setFontSize(10);
  report.recommendations.forEach((rec, index) => {
    doc.text(`${index + 1}. ${rec}`, 25, yPos + 10 + index * 10);
  });

  // 导出
  doc.save(filename);
}

// Excel 导出（使用 SheetJS）
export async function exportToExcel(report: DrillReport, filename: string): Promise<void> {
  const XLSX = await import('xlsx');

  // 创建工作簿
  const wb = XLSX.utils.book_new();

  // 基本信息 sheet
  const headerData = [
    ['会话ID', report.session_id],
    ['开始时间', report.start_time],
    ['结束时间', report.end_time],
    ['总分', report.score],
    ['等级', report.grade],
  ];
  const headerWS = XLSX.utils.aoa_to_sheet(headerData);
  XLSX.utils.book_append_sheet(wb, headerWS, '基本信息');

  // 线索验证 sheet
  const cluesData = [
    ['线索ID', '验证状态'],
    ...report.clues_verified.map(c => [c, '通过']),
  ];
  const cluesWS = XLSX.utils.aoa_to_sheet(cluesData);
  XLSX.utils.book_append_sheet(wb, cluesWS, '线索验证');

  // 时间线 sheet
  const timelineData = [
    ['时间', '事件类型', '描述'],
    ...report.timeline_summary.map(e => [e.time, e.event_type, e.description]),
  ];
  const timelineWS = XLSX.utils.aoa_to_sheet(timelineData);
  XLSX.utils.book_append_sheet(wb, timelineWS, '时间线');

  // 改进建议 sheet
  const recsData = [
    ['序号', '建议'],
    ...report.recommendations.map((r, i) => [i + 1, r]),
  ];
  const recsWS = XLSX.utils.aoa_to_sheet(recsData);
  XLSX.utils.book_append_sheet(wb, recsWS, '改进建议');

  // 导出
  XLSX.writeFile(wb, filename);
}

// 批量导出历史记录
export async function exportBatchReplays(
  replays: ReplayMetadata[],
  getReplayFn: (id: string) => { events: Array<Record<string, unknown>> } | null,
  format: 'json' | 'csv'
): Promise<void> {
  if (format === 'json') {
    const allData = replays.map(r => {
      const data = getReplayFn(r.id);
      return {
        ...r,
        events: data?.events || [],
      };
    });
    exportToJSON(allData, `replays_batch_${Date.now()}.json`);
  } else {
    const rows = replays.map(r => ({
      id: r.id,
      sessionId: r.sessionId,
      date: r.date,
      duration: r.duration,
      eventCount: r.eventCount,
      finalScore: r.finalScore,
    }));
    exportToCSV(rows, `replays_batch_${Date.now()}.csv`);
  }
}

// 模拟结果导出
export function exportSimulationResult(result: SimulationResult, format: 'json' | 'csv'): void {
  if (format === 'json') {
    exportToJSON(result, `simulation_${Date.now()}.json`);
  } else {
    // 将模拟结果转为表格格式
    const rows = result.alerts.map(a => ({
      rule_id: a.rule_id,
      rule_name: a.rule_name,
      triggered: a.triggered,
      ...(a.details as Record<string, unknown>),
    }));
    exportToCSV(rows, `simulation_${Date.now()}.csv`);
  }
}

// 通用下载函数
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 导出类型
export type ExportFormat = 'json' | 'csv' | 'pdf' | 'excel';