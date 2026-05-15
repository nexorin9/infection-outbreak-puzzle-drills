"""
暴发判断规则解析器
负责加载、解析和验证暴发规则
"""
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime
import yaml
from pathlib import Path


@dataclass
class DataCheckpoint:
    """数据检查点定义"""
    type: str  # microbiology_culture, antimicrobial_order, bed_flow, summary
    required_fields: List[str]
    filter_logic: str


@dataclass
class Rule:
    """暴发判断规则"""
    id: str
    name: str
    description: str
    time_window_hours: int
    threshold_count: int
    threshold_unit: str  # patient, percent, standard_deviation, cluster, rules_triggered
    related_systems: List[str]
    clue_text: str
    verification_query: str
    data_checkpoints: List[DataCheckpoint]
    hint: str
    next_clue_id: Optional[str]


@dataclass
class ValidationResult:
    """规则验证结果"""
    rule_id: str
    triggered: bool
    details: Dict[str, Any]
    timestamp: datetime = field(default_factory=datetime.now)


class RuleParser:
    """规则解析器"""

    def __init__(self):
        self.rules: List[Rule] = []

    def load_rules(self, yaml_path: str) -> List[Rule]:
        """从 YAML 文件加载规则"""
        path = Path(yaml_path)
        if not path.exists():
            raise FileNotFoundError(f"规则文件不存在: {yaml_path}")

        with open(path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)

        self.rules = []
        for rule_data in data.get('rules', []):
            rule = self._parse_rule(rule_data)
            self.rules.append(rule)

        return self.rules

    def _parse_rule(self, rule_data: Dict[str, Any]) -> Rule:
        """解析单条规则"""
        checkpoints = []
        for cp in rule_data.get('data_checkpoints', []):
            checkpoints.append(DataCheckpoint(
                type=cp.get('type', ''),
                required_fields=cp.get('required_fields', []),
                filter_logic=cp.get('filter_logic', '')
            ))

        return Rule(
            id=rule_data.get('id', ''),
            name=rule_data.get('name', ''),
            description=rule_data.get('description', ''),
            time_window_hours=rule_data.get('time_window_hours', 72),
            threshold_count=rule_data.get('threshold_count', 2),
            threshold_unit=rule_data.get('threshold_unit', 'patient'),
            related_systems=rule_data.get('related_systems', []),
            clue_text=rule_data.get('clue_text', ''),
            verification_query=rule_data.get('verification_query', ''),
            data_checkpoints=checkpoints,
            hint=rule_data.get('hint', ''),
            next_clue_id=rule_data.get('next_clue_id')
        )

    def get_rule_by_id(self, rule_id: str) -> Optional[Rule]:
        """根据 ID 获取规则"""
        for rule in self.rules:
            if rule.id == rule_id:
                return rule
        return None

    def get_rule_chain(self) -> List[Rule]:
        """获取规则链（按 next_clue_id 连成链）"""
        if not self.rules:
            return []

        # 找到起始规则（没有前置规则）
        start_rule = None
        for rule in self.rules:
            is_start = True
            for other in self.rules:
                if other.next_clue_id == rule.id:
                    is_start = False
                    break
            if is_start:
                start_rule = rule
                break

        if not start_rule:
            return self.rules

        # 按链顺序返回
        chain = [start_rule]
        current = start_rule
        while current.next_clue_id:
            next_rule = self.get_rule_by_id(current.next_clue_id)
            if next_rule:
                chain.append(next_rule)
                current = next_rule
            else:
                break

        return chain

    def validate_rule(self, rule: Rule, data: Dict[str, Any]) -> ValidationResult:
        """验证规则是否被触发"""
        details = {
            'rule_name': rule.name,
            'threshold': rule.threshold_count,
            'actual_count': 0,
            ' ward_id': None,
            'pathogen': None
        }

        # 根据规则类型进行验证
        # 这里是一个简化实现，实际应用中会调用对应的数据加载器

        if rule.id == 'rule_001':
            # 同病区同病原菌聚集
            cultures = data.get('microbiology_cultures', [])
            from datetime import timedelta
            now = datetime.now()
            window_start = now - timedelta(hours=rule.time_window_hours)

            # 按病区和病原菌分组统计
            ward_pathogen: Dict[str, Dict[str, set]] = {}
            for culture in cultures:
                if culture.get('result') == '阳性':
                    collect_time = culture.get('collect_time')
                    if isinstance(collect_time, str):
                        collect_time = datetime.fromisoformat(collect_time)
                    if collect_time >= window_start:
                        ward = culture.get('ward_id', '')
                        pathogen = culture.get('pathogen_name', '')
                        if ward not in ward_pathogen:
                            ward_pathogen[ward] = {}
                        if pathogen not in ward_pathogen[ward]:
                            ward_pathogen[ward][pathogen] = set()
                        ward_pathogen[ward][pathogen].add(culture.get('patient_id'))

            # 检查是否触发
            for ward, pathogens in ward_pathogen.items():
                for pathogen, patients in pathogens.items():
                    if len(patients) >= rule.threshold_count:
                        details['actual_count'] = len(patients)
                        details['ward_id'] = ward
                        details['pathogen'] = pathogen
                        return ValidationResult(
                            rule_id=rule.id,
                            triggered=True,
                            details=details
                        )

        elif rule.id == 'rule_004':
            # 器械相关感染聚集
            antimicrobials = data.get('antimicrobial_orders', [])
            from datetime import timedelta
            now = datetime.now()
            window_start = now - timedelta(hours=rule.time_window_hours)

            # 统计含器械的医嘱
            device_cases: Dict[str, int] = {}
            for order in antimicrobials:
                start_time = order.get('start_time')
                if isinstance(start_time, str):
                    start_time = datetime.fromisoformat(start_time)
                if start_time >= window_start:
                    device = order.get('device_type', '')
                    if device in ('CVC', '尿管', '呼吸机'):
                        ward = order.get('ward_id', '')
                        if ward not in device_cases:
                            device_cases[ward] = 0
                        device_cases[ward] += 1

            # 检查是否触发
            for ward, count in device_cases.items():
                if count >= rule.threshold_count:
                    details['actual_count'] = count
                    details['ward_id'] = ward
                    return ValidationResult(
                        rule_id=rule.id,
                        triggered=True,
                        details=details
                    )

        return ValidationResult(
            rule_id=rule.id,
            triggered=False,
            details=details
        )

    def get_metadata(self, yaml_path: str) -> Dict[str, Any]:
        """获取规则文件元数据"""
        path = Path(yaml_path)
        with open(path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
        return data.get('metadata', {})