"""
FastAPI REST API
暴露仿真结果和谜题状态管理接口
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

from ..puzzle_engine.clue_chain import ClueChainStateMachine, PuzzleSession, VerificationResult, PuzzleStatus
from ..puzzle_engine.scoring_engine import ScoringEngine, ScoreResult
from ..simulation.simulator import OutbreakSimulator, SimulationResult
from ..report_generator import ReportGenerator, DrillReport
from ..rules_parser import RuleParser
from ..data_loaders.bed_flow_loader import BedFlowLoader
from ..data_loaders.antimicrobial_loader import AntimicrobialLoader
from ..data_loaders.microbiology_loader import MicrobiologyLoader


# Pydantic 模型
class StartPuzzleRequest(BaseModel):
    data_path: Optional[str] = None


class VerifyCheckpointRequest(BaseModel):
    clue_id: str
    answer: str


class RunSimulationRequest(BaseModel):
    duration_hours: int = 168


# 创建 FastAPI 应用
app = FastAPI(
    title="Infection-Outbreak-Puzzle-Drills API",
    description="院感暴发桌面线索链推演系统 API",
    version="1.0.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局状态
state_machine: Optional[ClueChainStateMachine] = None
simulator: Optional[OutbreakSimulator] = None
scoring_engine = ScoringEngine()
report_generator = ReportGenerator()


def get_state_machine() -> ClueChainStateMachine:
    """获取或初始化状态机"""
    global state_machine
    if state_machine is None:
        # 加载规则
        rules_path = "backend/data/outbreak_rules.yaml"
        parser = RuleParser()
        rules = parser.load_rules(rules_path)
        state_machine = ClueChainStateMachine(rules)
    return state_machine


@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Infection-Outbreak-Puzzle-Drills"
    }


@app.post("/puzzle/start")
async def start_puzzle(request: StartPuzzleRequest = None):
    """启动新谜题会话"""
    sm = get_state_machine()
    session = sm.start_puzzle()
    return {
        "session_id": session.session_id,
        "status": session.status.value,
        "start_time": session.start_time,
        "message": "谜题会话已启动"
    }


@app.post("/puzzle/{session_id}/verify")
async def verify_checkpoint(session_id: str, request: VerifyCheckpointRequest):
    """验证检查点答案"""
    sm = get_state_machine()
    result = sm.verify_checkpoint(session_id, request.clue_id, request.answer)

    if not result.correct and "不存在" in result.message:
        raise HTTPException(status_code=404, detail=result.message)

    return {
        "correct": result.correct,
        "message": result.message,
        "next_clue_id": result.next_clue_id,
        "score_delta": result.score_delta
    }


@app.get("/puzzle/{session_id}/clue")
async def get_current_clue(session_id: str):
    """获取当前线索"""
    sm = get_state_machine()
    clue = sm.get_next_clue(session_id)

    if clue is None:
        raise HTTPException(status_code=404, detail="会话不存在或已完成")

    return {
        "clue_id": clue.clue_id,
        "rule_id": clue.rule_id,
        "description": clue.description,
        "data_checkpoints": clue.data_checkpoints,
        "hint": clue.hint
    }


@app.get("/puzzle/{session_id}/status")
async def get_session_status(session_id: str):
    """获取会话状态"""
    sm = get_state_machine()
    session = sm.get_session(session_id)

    if session is None:
        raise HTTPException(status_code=404, detail="会话不存在")

    return {
        "session_id": session.session_id,
        "current_clue_index": session.current_clue_index,
        "completed_clues": session.completed_clues,
        "score": session.score,
        "status": session.status.value,
        "start_time": session.start_time,
        "end_time": session.end_time,
        "hints_used": session.hints_used
    }


@app.get("/report/{session_id}")
async def get_report(session_id: str):
    """获取推演报告"""
    sm = get_state_machine()
    session = sm.get_session(session_id)

    if session is None:
        raise HTTPException(status_code=404, detail="会话不存在")

    score_result = scoring_engine.calculate_score(session)
    report = report_generator.generate_report(session, score_result, [])

    return {
        "session_id": report.session_id,
        "start_time": report.start_time,
        "end_time": report.end_time,
        "clues_verified": report.clues_verified,
        "score": report.score,
        "grade": report.grade,
        "timeline_summary": report.timeline_summary,
        "recommendations": report.recommendations
    }


@app.post("/simulation/run")
async def run_simulation(request: RunSimulationRequest = RunSimulationRequest()):
    """运行仿真生成暴发场景"""
    global simulator

    # 加载数据
    data_path_prefix = "backend/data/"
    bed_loader = BedFlowLoader()
    bed_flow = bed_loader.load(data_path_prefix + "bed_flow.csv")

    anti_loader = AntimicrobialLoader()
    antimicrobials = anti_loader.load(data_path_prefix + "antimicrobial_orders.csv")

    micro_loader = MicrobiologyLoader()
    cultures = micro_loader.load(data_path_prefix + "microbiology_cultures.csv")

    # 加载规则
    rules_path = "backend/data/outbreak_rules.yaml"
    parser = RuleParser()
    rules = parser.load_rules(rules_path)

    # 运行仿真
    simulator = OutbreakSimulator(rules, bed_flow, antimicrobials, cultures)
    result = simulator.simulate(request.duration_hours)

    return {
        "start_time": result.start_time.isoformat(),
        "end_time": result.end_time.isoformat(),
        "alerts": [
            {
                "rule_id": a.rule_id,
                "rule_name": a.rule_name,
                "triggered": a.triggered,
                "details": a.details
            }
            for a in result.alerts
        ],
        "clues": [
            {
                "clue_id": c.clue_id,
                "rule_id": c.rule_id,
                "description": c.description
            }
            for c in result.clues
        ],
        "summary": result.summary
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)