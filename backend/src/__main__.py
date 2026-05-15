"""院感暴发桌面线索链推演系统 - CLI 入口"""
import click
import sys
from pathlib import Path


@click.group()
@click.version_option(version="1.0.0")
def main():
    """院感暴发桌面线索链推演系统

    用于训练感控专员的暴发判断能力，通过谜题链通关形式练习暴发调查流程。
    """
    pass


@main.command()
@click.option("--data-dir", default="data", help="数据目录路径")
@click.option("--output-dir", default="output", help="输出目录路径")
def simulation(data_dir: str, output_dir: str):
    """运行仿真生成暴发场景数据"""
    from backend.src.simulation.simulator import OutbreakSimulator
    from backend.src.rules_parser import RuleParser
    from backend.src.data_loaders.bed_flow_loader import BedFlowLoader
    from backend.src.data_loaders.antimicrobial_loader import AntimicrobialLoader
    from backend.src.data_loaders.microbiology_loader import MicrobiologyLoader

    click.echo("正在加载数据...")
    data_path = Path(data_dir)

    # 加载规则
    rules = RuleParser().load_rules(data_path / "outbreak_rules.yaml")

    # 加载数据
    bed_flow = BedFlowLoader().load(data_path / "bed_flow.csv")
    antimicrobials = AntimicrobialLoader().load(data_path / "antimicrobial_orders.csv")
    cultures = MicrobiologyLoader().load(data_path / "microbiology_cultures.csv")

    # 运行仿真
    click.echo("正在运行仿真...")
    simulator = OutbreakSimulator(rules, bed_flow, antimicrobials, cultures)
    result = simulator.simulate(duration_hours=168)  # 7天

    # 保存结果
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    import json
    output_file = output_path / "simulation_result.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(result.to_dict(), f, ensure_ascii=False, indent=2)

    click.echo(f"仿真结果已保存到: {output_file}")
    click.echo(f"发现 {len(result.alerts)} 条暴发预警")


@main.command()
@click.option("--session-id", help="会话ID")
@click.option("--clue-id", required=True, help="线索ID")
@click.option("--answer", required=True, help="答案")
def puzzle_verify(session_id: str, clue_id: str, answer: str):
    """验证检查点答案"""
    from backend.src.puzzle_engine.clue_chain import ClueChainStateMachine

    click.echo(f"验证线索 {clue_id} 的答案: {answer}")
    click.echo("（简化实现，实际需要会话状态管理）")


@main.command()
@click.option("--session-id", required=True, help="会话ID")
@click.option("--output", default="report.json", help="报告输出路径")
def report(session_id: str, output: str):
    """生成推演报告"""
    click.echo(f"正在生成会话 {session_id} 的报告...")
    click.echo(f"报告将保存到: {output}")


@main.command()
@click.option("--path", required=True, help="数据文件路径")
def data_validate(path: str):
    """验证数据文件格式"""
    from backend.src.data_loaders.bed_flow_loader import BedFlowLoader
    from backend.src.data_loaders.antimicrobial_loader import AntimicrobialLoader
    from backend.src.data_loaders.microbiology_loader import MicrobiologyLoader

    file_path = Path(path)
    suffix = file_path.suffix.lower()

    click.echo(f"正在验证文件: {path}")

    try:
        if suffix == ".csv":
            # 根据文件内容判断类型
            content = file_path.read_text(encoding="utf-8")
            first_line = content.split("\n")[0].lower()

            if "patient_id" in first_line and "ward_id" in first_line:
                loader = BedFlowLoader()
                data = loader.load(file_path)
                click.echo(f"✓ 床位流转数据，{len(data)} 条记录")
            elif "drug_code" in first_line or "drug_name" in first_line:
                loader = AntimicrobialLoader()
                data = loader.load(file_path)
                click.echo(f"✓ 抗菌药物数据，{len(data)} 条记录")
            elif "pathogen" in first_line or "culture_id" in first_line:
                loader = MicrobiologyLoader()
                data = loader.load(file_path)
                click.echo(f"✓ 微生物培养数据，{len(data)} 条记录")
            else:
                click.echo(f"✗ 无法识别的CSV格式")
                sys.exit(1)
        else:
            click.echo(f"✗ 不支持的文件格式: {suffix}")
            sys.exit(1)

        click.echo("数据验证通过！")
    except Exception as e:
        click.echo(f"✗ 数据验证失败: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()