"""
线索链状态机
管理关卡进度和线索解锁逻辑
"""
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
from enum import Enum
import uuid


class PuzzleStatus(Enum):
    """谜题状态"""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class Clue:
    """线索定义"""
    clue_id: str
    rule_id: str
    description: str
    data_checkpoints: List[Dict[str, str]]
    hint: str
    next_clue_id: Optional[str]


@dataclass
class PuzzleSession:
    """谜题会话"""
    session_id: str
    current_clue_index: int
    completed_clues: List[str]
    score: float
    status: PuzzleStatus
    start_time: str
    end_time: Optional[str] = None
    hints_used: int = 0


@dataclass
class VerificationResult:
    """验证结果"""
    correct: bool
    message: str
    next_clue_id: Optional[str]
    score_delta: float


class ClueChainStateMachine:
    """线索链状态机"""

    def __init__(self, rules: List[Any]):
        self.rules = rules
        self.sessions: Dict[str, PuzzleSession] = {}
        self.clues: List[Clue] = self._build_clue_chain()

    def _build_clue_chain(self) -> List[Clue]:
        """根据规则构建线索链"""
        clues = []
        for rule in self.rules:
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
            clues.append(clue)
        return clues

    def start_puzzle(self) -> PuzzleSession:
        """启动新谜题会话"""
        session_id = str(uuid.uuid4())
        session = PuzzleSession(
            session_id=session_id,
            current_clue_index=0,
            completed_clues=[],
            score=0.0,
            status=PuzzleStatus.IN_PROGRESS,
            start_time=self._get_timestamp()
        )
        self.sessions[session_id] = session
        return session

    def verify_checkpoint(self, session_id: str, clue_id: str, answer: str) -> VerificationResult:
        """验证检查点答案"""
        session = self.sessions.get(session_id)
        if not session:
            return VerificationResult(
                correct=False,
                message="会话不存在",
                next_clue_id=None,
                score_delta=0.0
            )

        # 获取当前线索
        current_clue = self.clues[session.current_clue_index]
        if current_clue.clue_id != clue_id:
            return VerificationResult(
                correct=False,
                message="线索ID不匹配",
                next_clue_id=None,
                score_delta=0.0
            )

        # 简化验证逻辑：检查答案是否包含关键词
        correct_keywords = {
            'clue_rule_001': ['鲍曼不动杆菌', '内科病房', '2例'],
            'clue_rule_002': ['抗菌药物', '超标', 'DDD'],
            'clue_rule_003': ['阳性率', '标准差'],
            'clue_rule_004': ['器械', 'CVC', '尿管', '呼吸机'],
            'clue_rule_005': ['暴发', '报告', '建议']
        }

        expected_keywords = correct_keywords.get(clue_id, [])
        answer_correct = any(keyword in answer for keyword in expected_keywords)

        if answer_correct:
            # 标记当前线索完成
            session.completed_clues.append(clue_id)
            session.current_clue_index += 1

            # 计算分数（简化：每条线索10分）
            score_delta = 10.0 - (session.hints_used * 2)  # 使用了提示则扣分

            # 获取下一条线索
            next_clue_id = current_clue.next_clue_id

            # 检查是否完成
            if next_clue_id is None or session.current_clue_index >= len(self.clues):
                session.status = PuzzleStatus.COMPLETED
                session.end_time = self._get_timestamp()
                session.score += score_delta
                return VerificationResult(
                    correct=True,
                    message="恭喜！推演完成！",
                    next_clue_id=None,
                    score_delta=score_delta
                )

            return VerificationResult(
                correct=True,
                message="答案正确！继续下一条线索。",
                next_clue_id=next_clue_id,
                score_delta=score_delta
            )
        else:
            return VerificationResult(
                correct=False,
                message="答案不正确，请重新检查数据。提示：" + current_clue.hint,
                next_clue_id=None,
                score_delta=0.0
            )

    def get_next_clue(self, session_id: str) -> Optional[Clue]:
        """获取当前线索"""
        session = self.sessions.get(session_id)
        if not session:
            return None

        if session.current_clue_index < len(self.clues):
            return self.clues[session.current_clue_index]
        return None

    def is_puzzle_complete(self, session_id: str) -> bool:
        """检查谜题是否完成"""
        session = self.sessions.get(session_id)
        if not session:
            return False
        return session.status == PuzzleStatus.COMPLETED

    def use_hint(self, session_id: str) -> str:
        """使用提示"""
        session = self.sessions.get(session_id)
        if not session:
            return ""

        session.hints_used += 1
        current_clue = self.get_next_clue(session_id)
        if current_clue:
            return current_clue.hint
        return ""

    def get_session(self, session_id: str) -> Optional[PuzzleSession]:
        """获取会话状态"""
        return self.sessions.get(session_id)

    def get_all_sessions(self) -> Dict[str, PuzzleSession]:
        """获取所有会话"""
        return self.sessions

    def _get_timestamp(self) -> str:
        """获取当前时间戳"""
        from datetime import datetime
        return datetime.now().isoformat()

    def get_clue_by_id(self, clue_id: str) -> Optional[Clue]:
        """根据ID获取线索"""
        for clue in self.clues:
            if clue.clue_id == clue_id:
                return clue
        return None