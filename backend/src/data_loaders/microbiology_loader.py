"""
微生物培养数据加载器
负责从 CSV 读取微生物培养结果数据并转换为标准格式
"""
from dataclasses import dataclass
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path
import csv


@dataclass
class MicrobiologyRecord:
    """微生物培养记录"""
    culture_id: str
    patient_id: str
    specimen_type: str
    pathogen_code: str
    pathogen_name: str
    result: str  # 阳性, 阴性
    collect_time: datetime
    report_time: Optional[datetime]
    ward_id: str


class MicrobiologyLoader:
    """微生物培养数据加载器"""

    def __init__(self):
        self.records: List[MicrobiologyRecord] = []

    def load(self, csv_path: str) -> List[MicrobiologyRecord]:
        """从 CSV 文件加载微生物培养数据"""
        path = Path(csv_path)
        if not path.exists():
            raise FileNotFoundError(f"微生物培养数据文件不存在: {csv_path}")

        self.records = []
        with open(path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                record = MicrobiologyRecord(
                    culture_id=row.get('culture_id', ''),
                    patient_id=row.get('patient_id', ''),
                    specimen_type=row.get('specimen_type', ''),
                    pathogen_code=row.get('pathogen_code', ''),
                    pathogen_name=row.get('pathogen_name', ''),
                    result=row.get('result', ''),
                    collect_time=datetime.fromisoformat(row.get('collect_time', '')),
                    report_time=datetime.fromisoformat(row['report_time']) if row.get('report_time') else None,
                    ward_id=row.get('ward_id', '')
                )
                self.records.append(record)

        return self.records

    def filter_by_window(self, start_date: datetime, end_date: datetime) -> List[MicrobiologyRecord]:
        """按时间窗口过滤"""
        filtered = []
        for record in self.records:
            if record.collect_time <= end_date and record.collect_time >= start_date:
                filtered.append(record)
        return filtered

    def stats_by_ward_pathogen(self) -> Dict[str, Dict[str, int]]:
        """按病区+病原菌统计阳性数量"""
        stats: Dict[str, Dict[str, int]] = {}
        for record in self.records:
            if record.result == '阳性':
                if record.ward_id not in stats:
                    stats[record.ward_id] = {}
                pathogen = record.pathogen_name
                if pathogen not in stats[record.ward_id]:
                    stats[record.ward_id][pathogen] = 0
                stats[record.ward_id][pathogen] += 1
        return stats

    def get_cultures_by_ward(self, ward_id: str) -> List[MicrobiologyRecord]:
        """获取指定病区的培养结果"""
        return [r for r in self.records if r.ward_id == ward_id]

    def get_positive_cultures(self) -> List[MicrobiologyRecord]:
        """获取所有阳性培养结果"""
        return [r for r in self.records if r.result == '阳性']

    def calculate_positive_rate_by_ward(self) -> Dict[str, float]:
        """计算各病区阳性率"""
        total_by_ward: Dict[str, int] = {}
        positive_by_ward: Dict[str, int] = {}

        for record in self.records:
            if record.ward_id not in total_by_ward:
                total_by_ward[record.ward_id] = 0
                positive_by_ward[record.ward_id] = 0
            total_by_ward[record.ward_id] += 1
            if record.result == '阳性':
                positive_by_ward[record.ward_id] += 1

        rates: Dict[str, float] = {}
        for ward_id, total in total_by_ward.items():
            if total > 0:
                rates[ward_id] = positive_by_ward[ward_id] / total
            else:
                rates[ward_id] = 0.0
        return rates

    def get_patients_by_pathogen(self, pathogen_name: str) -> List[str]:
        """获取感染特定病原菌的患者ID列表（去重）"""
        patients = set()
        for record in self.records:
            if record.pathogen_name == pathogen_name and record.result == '阳性':
                patients.add(record.patient_id)
        return list(patients)