# Infection-Outbreak-Puzzle-Drills

Hospital Infection Outbreak Desktop Clue Chain Drill System - Reads bed flow, antimicrobial orders, and microbiology culture data to build outbreak detection rules, designed as a clue chain通关 (level-clear) format. Infection control specialists solve cases on desensitized data; each clue corresponds to a verifiable data checkpoint; completion equals a complete suspected outbreak chain. Outputs drill reports and training scores.

## Project Overview

This system simulates hospital infection outbreak scenarios through desktop exercises, helping infection control specialists learn and practice outbreak investigation procedures using a puzzle-chain level-clear format. The system generates outbreak scenario data based on the SimPy simulation engine and provides complete reasoning clue chains, scoring mechanisms, and drill reports.

## Core Features

- **Outbreak Rule Library**: Pre-defined outbreak detection rules (time windows, thresholds, correlated systems)
- **SimPy Simulation Engine**: Discrete event simulation generates outbreak scenario data
- **Clue Chain State Machine**: Puzzle level-clear mechanism managing stage progress and clue unlocking
- **Scoring Engine**: Calculates training scores based on checkpoint completion, time, and hint usage
- **Data Loaders**: Bed flow, antimicrobial, and microbiology culture data
- **Drill Reports**: Structured reports and training records

## Tech Stack

- **Backend**: Python (SimPy + FastAPI + Click)
- **Frontend**: React + TypeScript + Vite
- **Data**: CSV/YAML local data

## Directory Structure

```
infection-outbreak-puzzle-drills/
├── backend/               # Python backend
│   ├── src/
│   │   ├── data_loaders/  # Data loaders
│   │   ├── simulation/    # SimPy simulation engine
│   │   ├── puzzle_engine/ # Puzzle engine
│   │   ├── api/          # FastAPI interface
│   │   └── cli.py        # Click CLI
│   ├── data/             # Data files
│   └── tests/            # Unit tests
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # Components
│   │   ├── pages/        # Pages
│   │   ├── contexts/     # Context
│   │   └── api/          # API client
│   └── public/
├── buymeacoffee.png      # Donation image
└── README.md
```

## Quick Start

### Backend Installation

```bash
cd backend
pip install -r requirements.txt
```

### Run Simulation

```bash
cd backend
python -m src simulation run --duration 72
```

### Start API Server

```bash
cd backend
uvicorn src.api.main:app --reload --port 8000
```

### Frontend Start

```bash
cd frontend
npm install
npm run dev
```

## CLI Commands

```bash
# Run simulation
python -m src simulation run

# Start puzzle
python -m src puzzle start

# Verify checkpoint
python -m src puzzle verify --session-id <id> --clue-id <clue>

# Generate report
python -m src report generate --session-id <id>

# Load data
python -m src data load --path <csv_path>
```

## API Endpoints

- `GET /health` - Health check
- `POST /puzzle/start` - Start new puzzle session
- `POST /puzzle/{session_id}/verify` - Verify checkpoint answers
- `GET /puzzle/{session_id}/clue` - Get current clue
- `GET /puzzle/{session_id}/status` - Get session status
- `GET /report/{session_id}` - Get drill report
- `POST /simulation/run` - Run simulation

## Drill Flow

1. **Start Drill**: Select exercise scenario, system loads desensitized data
2. **Clue Exploration**: Search for evidence in data checkpoints based on clue hints
3. **Verify Answers**: Input checkpoint answers, system verifies correctness
4. **Advance Plot**: After verification, unlock next clue
5. **Complete Drill**: Generate score and report after passing all clues

## Scoring Mechanism

Scoring dimensions:
- Clue verification accuracy
- Completion time
- Hint usage count

Grade levels:
- Excellent (90-100)
- Good (75-89)
- Pass (60-74)
- Keep Trying (<60)

## Development Guide

### Adding New Rules

Add new rule definitions in `backend/data/outbreak_rules.yaml`.

### Adding Test Data

Add CSV files in the `backend/data/` directory.

### Running Tests

```bash
cd backend
pytest tests/
```

### Frontend Development

```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Development mode
npm run build        # Production build
npm run lint         # Lint code
```

### Data Export

Supports multiple formats for exporting drill reports:
- JSON: Complete data structure
- CSV: Tabular data, easy for analysis
- PDF: Print-friendly report format
- Excel: Multi-sheet workbook (basic info, clue verification, timeline, improvement suggestions)

### Replay Feature

The system automatically records the drill process, allowing viewing and replaying from history:
- Playback controls: play/pause/stop
- Speed adjustment: 0.5x / 1x / 1.5x / 2x / 4x
- Progress jump: Click event list to jump to any moment

### Keyboard Shortcuts

| Shortcut | Function |
|---------|----------|
| Ctrl+S | Save progress |
| Ctrl+H | Show help |
| Ctrl+N | New drill |
| Ctrl+Enter | Quick submit answer |
| Esc | Close popup |

### Internationalization

Supports Chinese/English switching, interface language can be changed at runtime via language switcher.

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Project Structure Details

```
infection-outbreak-puzzle-drills/
├── backend/                    # Python backend
│   ├── src/
│   │   ├── api/              # FastAPI REST API
│   │   ├── data_loaders/     # Data loader module
│   │   │   ├── bed_flow_loader.py
│   │   │   ├── antimicrobial_loader.py
│   │   │   └── microbiology_loader.py
│   │   ├── puzzle_engine/     # Puzzle engine
│   │   │   ├── clue_chain.py    # Clue chain state machine
│   │   │   └── scoring_engine.py # Scoring engine
│   │   ├── simulation/        # SimPy simulation engine
│   │   ├── rules_parser.py   # Rule parser
│   │   ├── report_generator.py # Report generator
│   │   ├── cli.py            # Click CLI entry
│   │   └── __main__.py       # CLI main module
│   ├── data/                  # Data files
│   │   ├── outbreak_rules.yaml # Outbreak rule library
│   │   ├── bed_flow.csv       # Bed flow data
│   │   ├── antimicrobial_orders.csv # Antimicrobial data
│   │   └── microbiology_cultures.csv # Microbiology culture data
│   └── tests/                 # Unit tests
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/       # React components
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
│   │   │   ├── PuzzleContext.tsx   # Puzzle state management
│   │   │   ├── ReplayContext.tsx   # Replay state management
│   │   │   └── ThemeContext.tsx    # Theme state management
│   │   ├── hooks/            # React Hooks
│   │   │   └── useKeyboardShortcuts.ts
│   │   ├── pages/             # Page components
│   │   │   ├── BoardingPage.tsx  # Big screen display page
│   │   │   ├── HelpPage.tsx      # Help page
│   │   │   ├── HistoryPage.tsx   # History page
│   │   │   ├── HomePage.tsx      # Home page
│   │   │   ├── PuzzlePage.tsx    # Puzzle page
│   │   │   ├── ReplayPage.tsx    # Replay page
│   │   │   ├── ReportPage.tsx    # Report page
│   │   │   └── SimulatorPage.tsx # Simulator config page
│   │   ├── services/          # Service modules
│   │   │   ├── EventRecorder.ts  # Event recorder
│   │   │   ├── ExportService.ts  # Data export service
│   │   │   └── HistoryService.ts # History service
│   │   ├── api/               # API client
│   │   │   └── client.ts
│   │   └── i18n/              # Internationalization
│   └── public/
├── docker-compose.yml         # Docker compose
├── Dockerfile                 # Backend Dockerfile
└── README.md
```

## Technical Details

### Outbreak Rule Engine

The rule engine supports the following detection conditions:
- Aggregation of same pathogen in same ward within time window
- Antimicrobial usage intensity exceeding threshold
- Sudden increase in positive microbiology culture rate
- Aggregation of device-associated infections (CLABSI/CAUTI/VAP)
- Multi-rule combination to confirm outbreak

### SimPy Simulation

Discrete event simulation engine simulates:
- Patient bed flow
- Antimicrobial usage
- Microbiology culture submission
- Outbreak warning generation

### Scoring Algorithm

Final score = Clue accuracy × 60% + Time efficiency × 25% + Hint savings × 15%

## License

MIT License