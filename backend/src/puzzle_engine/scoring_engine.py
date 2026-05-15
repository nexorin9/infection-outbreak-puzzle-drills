"""
评分引擎
根据检查点完成情况和时间计算培训评分
"""
from dataclasses import dataclass
from typing import Optional, List, Dict, Any
from datetime import datetime


@dataclass
class ScoreResult:
    """评分结果"""
    total_score: float
    accuracy_score: float
    speed_score: float
    hints_score: float
    grade: str  # A, B, C, D, F
    feedback: str


class ScoringEngine:
    """评分引擎"""

    def __init__(self):
        self.max_score_per_clue = 10.0
        self.max_hints = 3
        self.expected_time_minutes = 30  # 预期完成时间

    def calculate_score(self, session: Any) -> ScoreResult:
        """计算总评分"""
        # 准确度评分（占60%）
        accuracy_score = self._score_accuracy(
            len(session.completed_clues),
            session.total_clues if hasattr(session, 'total_clues') else 5
        )

        # 速度评分（占25%）
        elapsed_minutes = self._calculate_elapsed_minutes(session)
        speed_score = self._score_speed(elapsed_minutes, self.expected_time_minutes)

        # 提示使用评分（占15%）
        hints_score = self._score_hints_used(
            session.hints_used if hasattr(session, 'hints_used') else 0,
            self.max_hints
        )

        # 总分
        total_score = (
            accuracy_score * 0.6 +
            speed_score * 0.25 +
            hints_score * 0.15
        )

        # 等级
        grade = self._calculate_grade(total_score)

        # 反馈
        feedback = self._generate_feedback(total_score, accuracy_score, speed_score, hints_score)

        return ScoreResult(
            total_score=round(total_score, 2),
            accuracy_score=round(accuracy_score, 2),
            speed_score=round(speed_score, 2),
            hints_score=round(hints_score, 2),
            grade=grade,
            feedback=feedback
        )

    def _score_accuracy(self, clues_verified: int, total_clues: int) -> float:
        """计算准确度评分（0-100）"""
        if total_clues == 0:
            return 0.0
        return (clues_verified / total_clues) * 100.0

    def _score_speed(self, time_elapsed: float, expected_time: float) -> float:
        """计算速度评分（0-100）"""
        if expected_time <= 0:
            return 100.0

        ratio = time_elapsed / expected_time
        if ratio <= 1.0:
            # 提前或按时完成：满分
            return 100.0
        elif ratio <= 1.5:
            # 超过预期50%以内：扣20分
            return 80.0
        elif ratio <= 2.0:
            # 超过预期100%以内：扣40分
            return 60.0
        else:
            # 超过预期100%以上：扣60分
            return 40.0

    def _score_hints_used(self, hints_used: int, max_hints: int) -> float:
        """计算提示使用评分（0-100）"""
        if max_hints <= 0:
            return 100.0

        if hints_used == 0:
            return 100.0
        elif hints_used <= max_hints / 3:
            return 90.0
        elif hints_used <= max_hints * 2 / 3:
            return 70.0
        else:
            return 50.0

    def _calculate_elapsed_minutes(self, session: Any) -> float:
        """计算已用时间（分钟）"""
        try:
            start = datetime.fromisoformat(session.start_time)
            end_str = session.end_time
            if end_str:
                end = datetime.fromisoformat(end_str)
            else:
                end = datetime.now()
            delta = end - start
            return delta.total_seconds() / 60.0
        except:
            return self.expected_time_minutes  # 默认30分钟

    def _calculate_grade(self, total_score: float) -> str:
        """计算等级"""
        if total_score >= 90:
            return "A"
        elif total_score >= 80:
            return "B"
        elif total_score >= 70:
            return "C"
        elif total_score >= 60:
            return "D"
        else:
            return "F"

    def _generate_feedback(self, total: float, accuracy: float, speed: float, hints: float) -> str:
        """生成反馈信息"""
        feedbacks = []

        if accuracy >= 90:
            feedbacks.append("数据检查非常准确")
        elif accuracy >= 70:
            feedbacks.append("数据检查基本准确")
        else:
            feedbacks.append("需要加强数据检查能力")

        if speed >= 90:
            feedbacks.append("响应及时")
        elif speed >= 70:
            feedbacks.append("响应速度一般")
        else:
            feedbacks.append("响应速度有待提高")

        if hints >= 90:
            feedbacks.append("独立完成能力强")
        elif hints >= 70:
            feedbacks.append("有一定独立完成能力")
        else:
            feedbacks.append("建议加强自主分析")

        if total >= 80:
            feedbacks.append("整体表现优秀！")
        elif total >= 60:
            feedbacks.append("整体表现良好。")
        else:
            feedbacks.append("需要更多练习。")

        return "；".join(feedbacks)

    @staticmethod
    def grade_to_color(grade: str) -> str:
        """等级对应颜色"""
        color_map = {
            "A": "#52c41a",  # 绿色
            "B": "#1890ff",  # 蓝色
            "C": "#faad14",  # 黄色
            "D": "#fa8c16",  # 橙色
            "F": "#ff4d4f"   # 红色
        }
        return color_map.get(grade, "#999999")

    def get_score_breakdown(self, session: Any) -> Dict[str, Any]:
        """获取分数分解"""
        result = self.calculate_score(session)
        return {
            "total": result.total_score,
            "breakdown": {
                "accuracy": {
                    "score": result.accuracy_score,
                    "weight": "60%"
                },
                "speed": {
                    "score": result.speed_score,
                    "weight": "25%"
                },
                "hints": {
                    "score": result.hints_score,
                    "weight": "15%"
                }
            },
            "grade": result.grade,
            "grade_color": self.grade_to_color(result.grade)
        }