"""
暴发场景仿真引擎
使用 SimPy 进行离散事件仿真，生成暴发场景数据
"""
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import simpy
import random


@dataclass
class OutbreakAlert:
    """暴发预警"""
    rule_id: str
    rule_name: str
    triggered: bool
    timestamp: datetime
    details: Dict[str, Any]


@dataclass
class Clue:
    """线索"""
    clue_id: str
    rule_id: str
    description: str
    data_checkpoints: List[Dict[str, str]]
    hint: str
    next_clue_id: Optional[str]


@dataclass
class TimelineEvent:
    """时间线事件"""
    timestamp: datetime
    event_type: str
    description: str
    related_patients: List[str]
    related_rule: Optional[str] = None


@dataclass
class SimulationResult:
    """仿真结果"""
    alerts: List[OutbreakAlert]
    clues: List[Clue]
    timeline_events: List[TimelineEvent]
    start_time: datetime
    end_time: datetime
    summary: Dict[str, Any] = field(default_factory=dict)


class OutbreakSimulator:
    """暴发场景仿真器"""

    def __init__(self, rules: List[Any], bed_flow: List[Any],
                 antimicrobials: List[Any], cultures: List[Any]):
        self.rules = rules
        self.bed_flow = bed_flow
        self.antimicrobials = antimicrobials
        self.cultures = cultures
        self.env = simpy.Environment()
        self.alerts: List[OutbreakAlert] = []
        self.clues: List[Clue] = []
        self.timeline_events: List[TimelineEvent] = []

    def simulate(self, duration_hours: int = 168) -> SimulationResult:
        """运行仿真"""
        start_time = datetime.now()
        end_time = start_time + timedelta(hours=duration_hours)

        # 设置仿真环境
        self.env.process(self._run_simulation(duration_hours))
        self.env.run(until=duration_hours)

        # 执行暴发规则检查
        self._check_outbreak_rules()

        # 生成线索
        self._generate_clues()

        return SimulationResult(
            alerts=self.alerts,
            clues=self.clues,
            timeline_events=self.timeline_events,
            start_time=start_time,
            end_time=end_time,
            summary=self._generate_summary()
        )

    def _run_simulation(self, duration_hours: int):
        """运行仿真进程"""
        # 简化仿真：生成时间线事件
        for i in range(0, duration_hours, 24):
            yield self.env.timeout(24)
            # 模拟日常监测事件
            event = TimelineEvent(
                timestamp=datetime.now() + timedelta(hours=i),
                event_type="routine_monitoring",
                description=f"第{i//24+1}天日常监测完成",
                related_patients=[],
                related_rule=None
            )
            self.timeline_events.append(event)

    def _check_outbreak_rules(self) -> List[OutbreakAlert]:
        """检查暴发规则"""
        for rule in self.rules:
            if rule.id == 'rule_001':
                # 同病区同病原菌聚集检测
                alert = self._check_rule_001(rule)
                self.alerts.append(alert)
            elif rule.id == 'rule_002':
                # 抗菌药物使用强度异常
                alert = self._check_rule_002(rule)
                self.alerts.append(alert)
            elif rule.id == 'rule_004':
                # 器械相关感染聚集
                alert = self._check_rule_004(rule)
                self.alerts.append(alert)
            # 其他规则类似处理
        return self.alerts

    def _check_rule_001(self, rule) -> OutbreakAlert:
        """检查规则001：同病区同病原菌聚集"""
        from datetime import timedelta
        now = datetime.now()
        window_start = now - timedelta(hours=rule.time_window_hours)

        # 统计各病区病原菌
        ward_pathogen: Dict[str, Dict[str, set]] = {}
        for culture in self.cultures:
            if culture.result == '阳性':
                collect_time = culture.collect_time
                if isinstance(collect_time, str):
                    collect_time = datetime.fromisoformat(collect_time)
                if collect_time >= window_start:
                    ward = culture.ward_id
                    pathogen = culture.pathogen_name
                    if ward not in ward_pathogen:
                        ward_pathogen[ward] = {}
                    if pathogen not in ward_pathogen[ward]:
                        ward_pathogen[ward][pathogen] = set()
                    ward_pathogen[ward][pathogen].add(culture.patient_id)

        # 检查是否触发
        for ward, pathogens in ward_pathogen.items():
            for pathogen, patients in pathogens.items():
                if len(patients) >= rule.threshold_count:
                    return OutbreakAlert(
                        rule_id=rule.id,
                        rule_name=rule.name,
                        triggered=True,
                        timestamp=now,
                        details={
                            'ward_id': ward,
                            'pathogen': pathogen,
                            'patient_count': len(patients),
                            'patients': list(patients)
                        }
                    )

        return OutbreakAlert(
            rule_id=rule.id,
            rule_name=rule.name,
            triggered=False,
            timestamp=now,
            details={'message': '未检测到聚集'}
        )

    def _check_rule_002(self, rule) -> OutbreakAlert:
        """检查规则002：抗菌药物使用强度异常"""
        from datetime import timedelta
        now = datetime.now()
        window_start = now - timedelta(hours=rule.time_window_hours)

        # 简化检查：DDD超过阈值
        ddd_by_ward: Dict[str, float] = {}
        for order in self.antimicrobials:
            start_time = order.start_time
            if isinstance(start_time, str):
                start_time = datetime.fromisoformat(start_time)
            if start_time >= window_start:
                ward = order.ward_id
                if ward not in ddd_by_ward:
                    ddd_by_ward[ward] = 0.0
                ddd_by_ward[ward] += order.dosage

        # 检查是否触发（简化：内科病房使用强度高）
        for ward, ddd in ddd_by_ward.items():
            if '内科' in ward and ddd > 100:  # 简化阈值
                return OutbreakAlert(
                    rule_id=rule.id,
                    rule_name=rule.name,
                    triggered=True,
                    timestamp=now,
                    details={
                        'ward_id': ward,
                        'ddd': ddd,
                        'threshold_percent': rule.threshold_count
                    }
                )

        return OutbreakAlert(
            rule_id=rule.id,
            rule_name=rule.name,
            triggered=False,
            timestamp=now,
            details={'message': '抗菌药物使用强度正常'}
        )

    def _check_rule_004(self, rule) -> OutbreakAlert:
        """检查规则004：器械相关感染聚集"""
        from datetime import timedelta
        now = datetime.now()
        window_start = now - timedelta(hours=rule.time_window_hours)

        # 统计含器械的医嘱
        device_cases: Dict[str, List[str]] = {}
        for order in self.antimicrobials:
            start_time = order.start_time
            if isinstance(start_time, str):
                start_time = datetime.fromisoformat(start_time)
            if start_time >= window_start:
                device = order.device_type
                if device in ('CVC', '尿管', '呼吸机'):
                    ward = order.ward_id
                    if ward not in device_cases:
                        device_cases[ward] = []
                    device_cases[ward].append(order.patient_id)

        # 检查是否触发
        for ward, patients in device_cases.items():
            if len(patients) >= rule.threshold_count:
                return OutbreakAlert(
                    rule_id=rule.id,
                    rule_name=rule.name,
                    triggered=True,
                    timestamp=now,
                    details={
                        'ward_id': ward,
                        'patient_count': len(patients),
                        'patients': patients
                    }
                )

        return OutbreakAlert(
            rule_id=rule.id,
            rule_name=rule.name,
            triggered=False,
            timestamp=now,
            details={'message': '未检测到器械相关感染聚集'}
        )

    def _generate_clues(self) -> List[Clue]:
        """根据触发的规则生成线索"""
        triggered_rules = [a for a in self.alerts if a.triggered]

        for alert in triggered_rules:
            # 找到对应规则
            rule = None
            for r in self.rules:
                if r.id == alert.rule_id:
                    rule = r
                    break

            if rule:
                clue = Clue(
                    clue_id=f"clue_{rule.id}",
                    rule_id=rule.id,
                    description=rule.clue_text,
                    data_checkpoints=[
                        {
                            'type': cp.type,
                            'required_fields': ','.join(cp.required_fields),
                            'filter_logic': cp.filter_logic
                        }
                        for cp in rule.data_checkpoints
                    ],
                    hint=rule.hint,
                    next_clue_id=rule.next_clue_id
                )
                self.clues.append(clue)

        return self.clues

    def _generate_summary(self) -> Dict[str, Any]:
        """生成仿真摘要"""
        return {
            'total_alerts': len(self.alerts),
            'triggered_rules': sum(1 for a in self.alerts if a.triggered),
            'total_clues': len(self.clues),
            'timeline_events': len(self.timeline_events)
        }