# Infection-Outbreak-Puzzle-Drills

院感暴发桌面线索链推演系统 - 读取床位流转、抗菌药物医嘱、微生物培养结果数据，构建暴发判断规则库，设计为线索链通关形式。感控专员在脱敏数据上破案，每条线索对应一个可验证数据检查点，通关=疑似暴发链完整。输出推演报告+培训评分。

## 项目简介

本系统模拟医院感染暴发场景的桌面推演，通过谜题链通关形式帮助感控专员学习和练习暴发调查流程。系统基于 SimPy 仿真引擎生成暴发场景数据，并提供完整的推理线索链、评分机制和推演报告。

## 核心功能

- **暴发规则库**：预定义多条暴发判断规则（时间窗、阈值、关联系统）
- **SimPy 仿真引擎**：离散事件仿真生成暴发场景数据
- **线索链状态机**：谜题通关机制，管理关卡进度和线索解锁
- **评分引擎**：根据检查点完成情况、时间、提示使用计算培训评分
- **数据加载器**：床位流转、抗菌药物、微生物培养数据
- **推演报告**：结构化报告和培训记录

## 技术栈

- **后端**：Python (SimPy + FastAPI + Click)
- **前端**：React + TypeScript + Vite
- **数据**：CSV/YAML 本地数据

## 目录结构

```
infection-outbreak-puzzle-drills/
├── backend/               # Python 后端
│   ├── src/
│   │   ├── data_loaders/  # 数据加载器
│   │   ├── simulation/    # SimPy 仿真引擎
│   │   ├── puzzle_engine/ # 谜题引擎
│   │   ├── api/          # FastAPI 接口
│   │   └── cli.py        # Click CLI
│   ├── data/             # 数据文件
│   └── tests/            # 单元测试
├── frontend/             # React 前端
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── pages/        # 页面
│   │   ├── contexts/     # Context
│   │   └── api/          # API 客户端
│   └── public/
├── buymeacoffee.png      # 打赏图片
└── README.md
```

## 快速开始

### 后端安装

```bash
cd backend
pip install -r requirements.txt
```

### 运行仿真

```bash
cd backend
python -m src simulation run --duration 72
```

### 启动 API 服务

```bash
cd backend
uvicorn src.api.main:app --reload --port 8000
```

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

## CLI 命令

```bash
# 运行仿真
python -m src simulation run

# 启动谜题
python -m src puzzle start

# 验证检查点
python -m src puzzle verify --session-id <id> --clue-id <clue>

# 生成报告
python -m src report generate --session-id <id>

# 加载数据
python -m src data load --path <csv_path>
```

## API 端点

- `GET /health` - 健康检查
- `POST /puzzle/start` - 启动新谜题会话
- `POST /puzzle/{session_id}/verify` - 验证检查点答案
- `GET /puzzle/{session_id}/clue` - 获取当前线索
- `GET /puzzle/{session_id}/status` - 获取会话状态
- `GET /report/{session_id}` - 获取推演报告
- `POST /simulation/run` - 运行仿真

## 推演流程

1. **开始推演**：选择演练场景，系统加载脱敏数据
2. **线索探索**：根据线索提示，在数据检查点中寻找证据
3. **验证答案**：输入检查点答案，系统验证正确性
4. **推进剧情**：通过验证后解锁下一条线索
5. **完成推演**：通过所有线索后生成评分和报告

## 评分机制

评分维度：
- 线索验证准确率
- 完成时间
- 提示使用次数

等级划分：
- 优秀 (90-100)
- 良好 (75-89)
- 合格 (60-74)
- 继续努力 (<60)

## 开发指南

### 添加新规则

在 `backend/data/outbreak_rules.yaml` 中添加新规则定义。

### 添加测试数据

在 `backend/data/` 目录下添加 CSV 文件。

### 运行测试

```bash
cd backend
pytest tests/
```

### 前端开发

```bash
cd frontend
npm install          # 安装依赖
npm run dev          # 开发模式
npm run build        # 生产构建
npm run lint         # 代码检查
```

### 数据导出

支持多种格式导出推演报告：
- JSON：完整数据结构
- CSV：表格化数据，便于分析
- PDF：打印友好的报告格式
- Excel：多 sheet 工作簿（基本信息、线索验证、时间线、改进建议）

### 回放功能

系统自动记录推演过程，可以在历史记录中查看和回放：
- 播放控制：播放/暂停/停止
- 速度调节：0.5x / 1x / 1.5x / 2x / 4x
- 进度跳转：点击事件列表跳转到任意时刻

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+S | 保存进度 |
| Ctrl+H | 显示帮助 |
| Ctrl+N | 新建推演 |
| Ctrl+Enter | 快速提交答案 |
| Esc | 关闭弹窗 |

### 国际化

支持中英文切换，可以通过语言切换器在运行时更改界面语言。

### Docker 部署

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 项目结构详解

```
infection-outbreak-puzzle-drills/
├── backend/                    # Python 后端
│   ├── src/
│   │   ├── api/              # FastAPI REST API
│   │   ├── data_loaders/     # 数据加载器模块
│   │   │   ├── bed_flow_loader.py
│   │   │   ├── antimicrobial_loader.py
│   │   │   └── microbiology_loader.py
│   │   ├── puzzle_engine/     # 谜题引擎
│   │   │   ├── clue_chain.py    # 线索链状态机
│   │   │   └── scoring_engine.py # 评分引擎
│   │   ├── simulation/        # SimPy 仿真引擎
│   │   ├── rules_parser.py   # 规则解析器
│   │   ├── report_generator.py # 报告生成器
│   │   ├── cli.py            # Click CLI 入口
│   │   └── __main__.py       # CLI 主模块
│   ├── data/                  # 数据文件
│   │   ├── outbreak_rules.yaml # 暴发规则库
│   │   ├── bed_flow.csv       # 床位流转数据
│   │   ├── antimicrobial_orders.csv # 抗菌药物数据
│   │   └── microbiology_cultures.csv # 微生物培养数据
│   └── tests/                 # 单元测试
├── frontend/                  # React 前端
│   ├── src/
│   │   ├── components/       # React 组件
│   │   │   ├── AnswerInput.tsx
│   │   │   ├── ClueDetail.tsx
│   │   │   ├── ClueList.tsx
│   │   │   ├── DataCheckpoint.tsx
│   │   │   ├── DataImporter.tsx
│   │   │   ├── ExportButton.tsx
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── Timer.tsx
│   │   │   └── ToastProvider.tsx
│   │   ├── contexts/          # React Context
│   │   │   ├── PuzzleContext.tsx   # 谜题状态管理
│   │   │   ├── ReplayContext.tsx   # 回放状态管理
│   │   │   └── ThemeContext.tsx    # 主题状态管理
│   │   ├── hooks/            # React Hooks
│   │   │   └── useKeyboardShortcuts.ts
│   │   ├── pages/             # 页面组件
│   │   │   ├── BoardingPage.tsx  # 大屏展示页
│   │   │   ├── HelpPage.tsx      # 帮助页面
│   │   │   ├── HistoryPage.tsx   # 历史记录页
│   │   │   ├── HomePage.tsx      # 首页
│   │   │   ├── PuzzlePage.tsx    # 谜题页面
│   │   │   ├── ReplayPage.tsx    # 回放页面
│   │   │   ├── ReportPage.tsx    # 报告页面
│   │   │   └── SimulatorPage.tsx # 模拟器配置页
│   │   ├── services/          # 服务模块
│   │   │   ├── EventRecorder.ts  # 事件记录器
│   │   │   ├── ExportService.ts  # 数据导出服务
│   │   │   └── HistoryService.ts # 历史记录服务
│   │   ├── api/               # API 客户端
│   │   │   └── client.ts
│   │   └── i18n/              # 国际化
│   └── public/
├── docker-compose.yml         # Docker 编排
├── Dockerfile                 # 后端 Dockerfile
└── README.md
```

## 技术细节

### 暴发规则引擎

规则引擎支持以下判断条件：
- 时间窗口内同病区同病原菌聚集
- 抗菌药物使用强度超出阈值
- 微生物培养阳性率骤升
- 器械相关感染（CLABSI/CAUTI/VAP）聚集
- 多规则组合确认暴发

### SimPy 仿真

离散事件仿真引擎模拟：
- 患者床位流转
- 抗菌药物使用
- 微生物培养送检
- 暴发预警生成

### 评分算法

最终评分 = 线索准确率 × 60% + 时间效率 × 25% + 提示节省 × 15%

## License

MIT License

---

## 支持作者

如果您觉得这个项目对您有帮助，欢迎打赏支持！
Wechat:gdgdmp
![Buy Me a Coffee](buymeacoffee.png)

**Buy me a coffee (crypto)**

| 币种 | 地址 |
|------|------|
| BTC | `bc1qc0f5tv577z7yt59tw8qaq3tey98xehy32frzd` |
| ETH / USDT | `0x3b7b6c47491e4778157f0756102f134d05070704` |
| SOL | `6Xuk373zc6x6XWcAAuqvbWW92zabJdCmN3CSwpsVM6sd` |