"""测试规则解析器"""
import pytest
import sys
from pathlib import Path

# 添加 src 到路径
sys.path.insert(0, str(Path(__file__).parent.parent / 'src'))

from rules_parser import RuleParser, Rule, DataCheckpoint


def test_rule_parser_load_rules():
    """测试加载规则"""
    parser = RuleParser()
    # 使用实际数据文件
    data_path = Path(__file__).parent.parent / 'data' / 'outbreak_rules.yaml'
    if data_path.exists():
        rules = parser.load_rules(str(data_path))
        assert len(rules) == 5
        assert rules[0].id == 'rule_001'
        assert rules[0].name == '同病区同病原菌聚集'


def test_rule_parser_get_rule_by_id():
    """测试按 ID 获取规则"""
    parser = RuleParser()
    data_path = Path(__file__).parent.parent / 'data' / 'outbreak_rules.yaml'
    if data_path.exists():
        parser.load_rules(str(data_path))
        rule = parser.get_rule_by_id('rule_001')
        assert rule is not None
        assert rule.id == 'rule_001'


def test_rule_parser_get_rule_chain():
    """测试获取规则链"""
    parser = RuleParser()
    data_path = Path(__file__).parent.parent / 'data' / 'outbreak_rules.yaml'
    if data_path.exists():
        parser.load_rules(str(data_path))
        chain = parser.get_rule_chain()
        assert len(chain) > 0


if __name__ == '__main__':
    pytest.main([__file__, '-v'])