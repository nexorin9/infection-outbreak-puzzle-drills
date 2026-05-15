"""
床位流转数据加载器
负责从 CSV 读取床位流转数据并转换为标准格式
"""
from dataclasses import dataclass
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path
import csv


@dataclass
class BedFlowRecord:
    """床位流转记录"""
    patient_id: str
    ward_id: str
    bed_id: str
    admission_date: datetime
    discharge_date: Optional[datetime]
    transfer_count: int


class BedFlowLoader:
    """床位流转数据加载器"""

    def __init__(self):
        self.records: List[BedFlowRecord] = []

    def load(self, csv_path: str) -> List[BedFlowRecord]:
        """从 CSV 文件加载床位流转数据"""
        path = Path(csv_path)
        if not path.exists():
            raise FileNotFoundError(f"床位流转数据文件不存在: {csv_path}")

        self.records = []
        with open(path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                record = BedFlowRecord(
                    patient_id=row.get('patient_id', ''),
                    ward_id=row.get('ward_id', ''),
                    bed_id=row.get('bed_id', ''),
                    admission_date=datetime.fromisoformat(row.get('admission_date', '')),
                    discharge_date=datetime.fromisoformat(row['discharge_date']) if row.get('discharge_date') else None,
                    transfer_count=int(row.get('transfer_count', 0))
                )
                self.records.append(record)

        return self.records

    def filter_by_window(self, start_date: datetime, end_date: datetime) -> List[BedFlowRecord]:
        """按时间窗口过滤（在院患者）"""
        filtered = []
        for record in self.records:
            # 患者在时间窗口内住院
            if record.admission_date <= end_date:
                if record.discharge_date is None or record.discharge_date >= start_date:
                    filtered.append(record)
        return filtered

    def stats_by_ward(self) -> Dict[str, int]:
        """按病区统计患者数量"""
        stats: Dict[str, int] = {}
        for record in self.records:
            if record.ward_id not in stats:
                stats[record.ward_id] = 0
            stats[record.ward_id] += 1
        return stats

    def get_patients_by_ward(self, ward_id: str) -> List[BedFlowRecord]:
        """获取指定病区的患者列表"""
        return [r for r in self.records if r.ward_id == ward_id]

    def get_patient_by_id(self, patient_id: str) -> Optional[BedFlowRecord]:
        """根据患者ID获取记录"""
        for record in self.records:
            if record.patient_id == patient_id:
                return record
        return None