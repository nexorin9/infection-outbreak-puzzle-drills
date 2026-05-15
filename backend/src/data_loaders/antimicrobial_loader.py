"""
抗菌药物数据加载器
负责从 CSV 读取抗菌药物医嘱数据并转换为标准格式
"""
from dataclasses import dataclass
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path
import csv


@dataclass
class AntimicrobialRecord:
    """抗菌药物医嘱记录"""
    order_id: str
    patient_id: str
    drug_code: str
    drug_name: str
    start_time: datetime
    end_time: Optional[datetime]
    dosage: float
    ward_id: str
    device_type: Optional[str] = None  # CVC, 尿管, 呼吸机


class AntimicrobialLoader:
    """抗菌药物数据加载器"""

    def __init__(self):
        self.records: List[AntimicrobialRecord] = []

    def load(self, csv_path: str) -> List[AntimicrobialRecord]:
        """从 CSV 文件加载抗菌药物数据"""
        path = Path(csv_path)
        if not path.exists():
            raise FileNotFoundError(f"抗菌药物数据文件不存在: {csv_path}")

        self.records = []
        with open(path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                record = AntimicrobialRecord(
                    order_id=row.get('order_id', ''),
                    patient_id=row.get('patient_id', ''),
                    drug_code=row.get('drug_code', ''),
                    drug_name=row.get('drug_name', ''),
                    start_time=datetime.fromisoformat(row.get('start_time', '')),
                    end_time=datetime.fromisoformat(row['end_time']) if row.get('end_time') else None,
                    dosage=float(row.get('dosage', 0)),
                    ward_id=row.get('ward_id', ''),
                    device_type=row.get('device_type') or None
                )
                self.records.append(record)

        return self.records

    def filter_by_window(self, start_date: datetime, end_date: datetime) -> List[AntimicrobialRecord]:
        """按时间窗口过滤"""
        filtered = []
        for record in self.records:
            if record.start_time <= end_date:
                if record.end_time is None or record.end_time >= start_date:
                    filtered.append(record)
        return filtered

    def stats_by_ward_drug(self) -> Dict[str, Dict[str, int]]:
        """按病区+药品统计使用次数"""
        stats: Dict[str, Dict[str, int]] = {}
        for record in self.records:
            if record.ward_id not in stats:
                stats[record.ward_id] = {}
            drug = record.drug_name
            if drug not in stats[record.ward_id]:
                stats[record.ward_id][drug] = 0
            stats[record.ward_id][drug] += 1
        return stats

    def get_orders_by_ward(self, ward_id: str) -> List[AntimicrobialRecord]:
        """获取指定病区的医嘱列表"""
        return [r for r in self.records if r.ward_id == ward_id]

    def get_orders_by_patient(self, patient_id: str) -> List[AntimicrobialRecord]:
        """获取指定患者的医嘱列表"""
        return [r for r in self.records if r.patient_id == patient_id]

    def get_device_related_orders(self, device_type: str = None) -> List[AntimicrobialRecord]:
        """获取器械相关感染医嘱"""
        results = []
        for record in self.records:
            if device_type:
                if record.device_type == device_type:
                    results.append(record)
            elif record.device_type in ('CVC', '尿管', '呼吸机'):
                results.append(record)
        return results

    def calculate_ddd_by_ward(self) -> Dict[str, float]:
        """计算各病区抗菌药物使用强度（DDD简化）"""
        ddd_stats: Dict[str, float] = {}
        for record in self.records:
            if record.ward_id not in ddd_stats:
                ddd_stats[record.ward_id] = 0.0
            ddd_stats[record.ward_id] += record.dosage
        return ddd_stats