import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// 状态接口
interface PuzzleState {
  sessionId: string | null;
  currentClueIndex: number;
  completedClues: string[];
  score: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  hintsUsed: number;
  startTime: string | null;
}

// 动作类型
type PuzzleAction =
  | { type: 'START_PUZZLE'; payload: { sessionId: string; startTime: string } }
  | { type: 'VERIFY_ANSWER'; payload: { correct: boolean; scoreDelta: number; nextClueId: string | null } }
  | { type: 'NEXT_CLUE'; payload: { clueIndex: number } }
  | { type: 'COMPLETE'; payload: { finalScore: number } }
  | { type: 'USE_HINT' }
  | { type: 'RESET' };

// 初始状态
const initialState: PuzzleState = {
  sessionId: null,
  currentClueIndex: 0,
  completedClues: [],
  score: 0,
  status: 'not_started',
  hintsUsed: 0,
  startTime: null,
};

// Reducer 函数
function puzzleReducer(state: PuzzleState, action: PuzzleAction): PuzzleState {
  switch (action.type) {
    case 'START_PUZZLE':
      return {
        ...state,
        sessionId: action.payload.sessionId,
        startTime: action.payload.startTime,
        status: 'in_progress',
        currentClueIndex: 0,
        completedClues: [],
        score: 0,
        hintsUsed: 0,
      };
    case 'VERIFY_ANSWER':
      if (action.payload.correct) {
        return {
          ...state,
          completedClues: [...state.completedClues, `clue_${state.currentClueIndex}`],
          score: state.score + action.payload.scoreDelta,
          currentClueIndex: state.currentClueIndex + 1,
        };
      }
      return state;
    case 'NEXT_CLUE':
      return {
        ...state,
        currentClueIndex: action.payload.clueIndex,
      };
    case 'COMPLETE':
      return {
        ...state,
        status: 'completed',
        score: action.payload.finalScore,
      };
    case 'USE_HINT':
      return {
        ...state,
        hintsUsed: state.hintsUsed + 1,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Context
interface PuzzleContextType {
  state: PuzzleState;
  dispatch: React.Dispatch<PuzzleAction>;
}

const PuzzleContext = createContext<PuzzleContextType | undefined>(undefined);

// Provider 组件
export function PuzzleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(puzzleReducer, initialState);

  return (
    <PuzzleContext.Provider value={{ state, dispatch }}>
      {children}
    </PuzzleContext.Provider>
  );
}

// Hook
export function usePuzzle() {
  const context = useContext(PuzzleContext);
  if (context === undefined) {
    throw new Error('usePuzzle must be used within a PuzzleProvider');
  }
  return context;
}

export type { PuzzleState, PuzzleAction };