"""
推演报告生成器
输出结构化报告和培训记录
"""
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from datetime import datetime
import json


@dataclass
class DrillReport:
    """推演报告"""
    session_id: str
    start_time: str
    end_time: str
    clues_verified: List[str]
    score: float
    grade: str
    timeline_summary: List[Dict[str, Any]]
    recommendations: List[str]
    metadata: Dict[str, Any] = field(default_factory=dict)


class ReportGenerator:
    """推演报告生成器"""

    def __init__(self):
        self.template_version = "1.0"

    def generate_report(self, session: Any, score_result: Any, timeline: List[Any]) -> DrillReport:
        """生成推演报告"""
        return DrillReport(
            session_id=session.session_id,
            start_time=session.start_time,
            end_time=session.end_time or datetime.now().isoformat(),
            clues_verified=session.completed_clues,
            score=score_result.total_score,
            grade=score_result.grade,
            timeline_summary=self._generate_timeline_summary(timeline),
            recommendations=self._generate_recommendations(session, score_result),
            metadata={
                "version": self.template_version,
                "generated_at": datetime.now().isoformat(),
                "clues_total": session.current_clue_index,
                "hints_used": session.hints_used if hasattr(session, 'hints_used') else 0
            }
        )

    def generate_summary_text(self, report: DrillReport) -> str:
        """生成摘要文本"""
        lines = [
            "=" * 40,
            "医院感染暴发桌面推演报告",
            "=" * 40,
            f"会话ID: {report.session_id}",
            f"开始时间: {report.start_time}",
            f"结束时间: {report.end_time}",
            f"总分: {report.score:.2f} (等级: {report.grade})",
            f"线索验证: {len(report.clues_verified)}/5",
            "-" * 40,
            "时间线摘要:"
        ]

        for event in report.timeline_summary[:5]:  # 只显示前5个
            lines.append(f"  [{event.get('time', '')}] {event.get('description', '')}")

        lines.append("-" * 40)
        lines.append("改进建议:")
        for i, rec in enumerate(report.recommendations, 1):
            lines.append(f"  {i}. {rec}")

        lines.append("=" * 40)
        return "\n".join(lines)

    def export_json(self, report: DrillReport, output_path: str) -> None:
        """导出为 JSON"""
        data = {
            "session_id": report.session_id,
            "start_time": report.start_time,
            "end_time": report.end_time,
            "clues_verified": report.clues_verified,
            "score": report.score,
            "grade": report.grade,
            "timeline_summary": report.timeline_summary,
            "recommendations": report.recommendations,
            "metadata": report.metadata
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def export_text(self, report: DrillReport, output_path: str) -> None:
        """导出为文本"""
        content = self.generate_summary_text(report)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)

    def _generate_timeline_summary(self, timeline: List[Any]) -> List[Dict[str, Any]]:
        """生成时间线摘要"""
        summary = []
        for event in timeline:
            summary.append({
                "time": event.timestamp.isoformat() if hasattr(event, 'timestamp') else str(event.get('timestamp', '')),
                "event_type": event.event_type if hasattr(event, 'event_type') else str(event.get('type', '')),
                "description": event.description if hasattr(event, 'description') else str(event.get('description', ''))
            })
        return summary

    def _generate_recommendations(self, session: Any, score_result: Any) -> List[str]:
        """生成改进建议"""
        recommendations = []

        # 根据分数生成建议
        if score_result.accuracy_score < 80:
            recommendations.append("建议加强数据分析和关联能力，注意同一病区、相同病原菌患者的筛查")
            recommendations.append("复习微生物培养结果与床位流转数据的关联方法")

        if score_result.speed_score < 80:
            recommendations.append("建议熟练掌握暴发判断规则的时间窗口计算方法")
            recommendations.append("可使用辅助工具快速筛选数据")

        if score_result.hints_score < 80:
            recommendations.append("建议增加自主分析训练，减少对提示的依赖")

        if score_result.grade in ['D', 'F']:
            recommendations.append("建议重新学习院感暴发判断标准（国家卫健委相关规范）")
            recommendations.append("可参加线下培训后再进行推演练习")

        # 通用建议
        if not recommendations:
            recommendations.append("继续保持良好的数据敏感性")
            recommendations.append("建议定期进行推演练习，保持对暴发判断规则的熟悉度")

        return recommendations

    def generate_feedback_report(self, session: Any) -> Dict[str, Any]:
        """生成详细反馈报告"""
        return {
            "session_id": session.session_id,
            "performance": {
                "clues_completed": len(session.completed_clues),
                "current_clue": session.current_clue_index,
                "status": session.status.value if hasattr(session.status, 'value') else str(session.status)
            },
            "strengths": [
                "对暴发判断规则有一定了解",
                "能够进行基础数据关联分析"
            ],
            "areas_for_improvement": [
                "时间窗口计算需要更精确",
                "多系统数据关联能力需要加强"
            ],
            "next_steps": [
                "复习Rule_001至Rule_005的具体内容",
                "练习使用SQL和数据加载器",
                "参加模拟暴发场景演练"
            ]
        }