import { useState } from 'react';
import type { DrillReport } from '../api/client';
import {
  exportToJSON,
  exportToCSV,
  exportToPDF,
  exportToExcel,
  reportToCSVData,
  type ExportFormat,
} from '../services/ExportService';

interface ExportButtonProps {
  report: DrillReport;
}

export default function ExportButton({ report }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  async function handleExport(format: ExportFormat) {
    setIsExporting(true);
    setShowMenu(false);

    try {
      const timestamp = Date.now();
      const baseFilename = `report_${report.session_id}_${timestamp}`;

      switch (format) {
        case 'json':
          exportToJSON(report, `${baseFilename}.json`);
          break;
        case 'csv':
          const csvData = reportToCSVData(report);
          exportToCSV(csvData, `${baseFilename}.csv`);
          break;
        case 'pdf':
          await exportToPDF(report, `${baseFilename}.pdf`);
          break;
        case 'excel':
          await exportToExcel(report, `${baseFilename}.xlsx`);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
      >
        {isExporting ? (
          <>
            <span className="animate-spin">⟳</span>
            导出中...
          </>
        ) : (
          <>
            ↓ 导出报告
          </>
        )}
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            <button
              onClick={() => handleExport('json')}
              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <span className="text-gray-400">{}</span>
              JSON 格式
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <span className="text-gray-400">|||</span>
              CSV 格式
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <span className="text-gray-400">PDF</span>
              PDF 格式
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <span className="text-gray-400">XLS</span>
              Excel 格式
            </button>
          </div>
        </div>
      )}
    </div>
  );
}