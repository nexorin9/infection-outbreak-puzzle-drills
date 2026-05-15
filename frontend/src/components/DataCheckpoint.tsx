interface DataCheckpointProps {
  checkpoints: Array<{
    type: string;
    required_fields: string;
    filter_logic: string;
  }>;
}

const checkpointLabels: Record<string, string> = {
  microbiology_culture: '微生物培养数据',
  antimicrobial_order: '抗菌药物医嘱数据',
  bed_flow: '床位流转数据',
  summary: '综合分析',
};

const checkpointColors: Record<string, string> = {
  microbiology_culture: 'bg-purple-50 border-purple-200',
  antimicrobial_order: 'bg-green-50 border-green-200',
  bed_flow: 'bg-orange-50 border-orange-200',
  summary: 'bg-gray-50 border-gray-200',
};

export default function DataCheckpoint({ checkpoints }: DataCheckpointProps) {
  if (checkpoints.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">数据检查点</h2>
        <p className="text-gray-500 text-sm">暂无数据检查点</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">数据检查点</h2>
      <ul className="space-y-3">
        {checkpoints.map((cp, index) => (
          <li
            key={index}
            className={`p-3 rounded-lg border ${checkpointColors[cp.type] || 'bg-gray-50 border-gray-200'}`}
          >
            <h3 className="font-medium text-gray-800 mb-2">
              {checkpointLabels[cp.type] || cp.type}
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">必需字段：</span>
                {cp.required_fields}
              </p>
              <p>
                <span className="font-medium">筛选逻辑：</span>
                <span className="font-mono text-xs">{cp.filter_logic}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}