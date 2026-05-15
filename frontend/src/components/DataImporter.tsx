import { useState } from 'react';

interface DataImporterProps {
  onImportComplete?: (data: Record<string, unknown>) => void;
}

type FileType = 'bed_flow' | 'antimicrobial' | 'microbiology' | 'unknown';

export default function DataImporter({ onImportComplete }: DataImporterProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType>('unknown');
  const [preview, setPreview] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }

  function handleFile(file: File) {
    setError(null);
    const suffix = file.name.split('.').pop()?.toLowerCase();
    if (suffix !== 'csv' && suffix !== 'xlsx') {
      setError('仅支持 CSV 或 Excel 文件');
      return;
    }
    setFile(file);
    // 读取预览
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').slice(0, 11);
      const data = lines.map((line) => line.split(','));
      setPreview(data);
      // 检测文件类型
      const firstLine = data[0]?.join(',').toLowerCase() || '';
      if (firstLine.includes('patient_id') && firstLine.includes('ward_id') && firstLine.includes('bed_id')) {
        setFileType('bed_flow');
      } else if (firstLine.includes('drug_code') || firstLine.includes('drug_name')) {
        setFileType('antimicrobial');
      } else if (firstLine.includes('pathogen') || firstLine.includes('culture_id')) {
        setFileType('microbiology');
      } else {
        setFileType('unknown');
      }
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!file || fileType === 'unknown') {
      setError('无法识别文件类型，请检查文件格式');
      return;
    }
    // 模拟导入
    onImportComplete?.({ fileType, fileName: file.name });
  }

  const typeLabels: Record<FileType, string> = {
    bed_flow: '床位流转数据',
    antimicrobial: '抗菌药物数据',
    microbiology: '微生物培养数据',
    unknown: '未知类型',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">数据导入</h2>

      {/* 拖拽区域 */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFileChange}
          className="hidden"
          id="file-input"
        />
        <label htmlFor="file-input" className="cursor-pointer">
          <p className="text-gray-600 mb-2">拖拽文件到此处，或点击选择文件</p>
          <p className="text-sm text-gray-400">支持 CSV、Excel 格式</p>
        </label>
      </div>

      {/* 文件信息 */}
      {file && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">{file.name}</p>
              <p className="text-sm text-gray-500">
                类型: <span className="font-medium">{typeLabels[fileType]}</span>
              </p>
            </div>
            <button
              onClick={() => { setFile(null); setPreview([]); setFileType('unknown'); }}
              className="text-gray-400 hover:text-gray-600"
            >
              移除
            </button>
          </div>
        </div>
      )}

      {/* 预览 */}
      {preview.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium text-gray-700 mb-2">数据预览（前10行）</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  {preview[0]?.map((cell, i) => (
                    <th key={i} className="px-2 py-1 text-left">{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(1).map((row, i) => (
                  <tr key={i} className="border-b">
                    {row.map((cell, j) => (
                      <td key={j} className="px-2 py-1">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 错误 */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* 导入按钮 */}
      {file && fileType !== 'unknown' && (
        <button
          onClick={handleImport}
          className="mt-4 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          导入数据
        </button>
      )}
    </div>
  );
}