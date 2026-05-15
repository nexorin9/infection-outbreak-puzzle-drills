import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import {
  RecordedEvent,
  getRecorder,
  saveReplay,
  getReplay,
  getReplayList,
  ReplayMetadata,
  resetRecorder,
} from '../services/EventRecorder';
import { usePuzzle } from './PuzzleContext';

interface ReplayState {
  isReplaying: boolean;
  isPaused: boolean;
  currentEventIndex: number;
  playbackSpeed: number;
  events: RecordedEvent[];
  replayId: string | null;
}

interface ReplayContextType {
  state: ReplayState;
  replayList: ReplayMetadata[];
  startReplay: (replayId: string) => boolean;
  startRecording: (sessionId: string) => void;
  stopRecording: () => string | null;
  play: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setSpeed: (speed: number) => void;
  seekTo: (eventIndex: number) => void;
  getCurrentEvent: () => RecordedEvent | null;
  deleteReplayRecord: (replayId: string) => void;
}

const initialState: ReplayState = {
  isReplaying: false,
  isPaused: false,
  currentEventIndex: 0,
  playbackSpeed: 1,
  events: [],
  replayId: null,
};

const ReplayContext = createContext<ReplayContextType | undefined>(undefined);

export function ReplayProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ReplayState>(initialState);
  const [replayList, setReplayList] = useState<ReplayMetadata[]>(getReplayList());
  const { state: puzzleState } = usePuzzle();
  const playbackTimerRef = useRef<number | null>(null);

  const clearPlaybackTimer = useCallback(() => {
    if (playbackTimerRef.current) {
      window.clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
  }, []);

  const startRecording = useCallback((sessionId: string) => {
    const recorder = getRecorder();
    recorder.setSessionId(sessionId);
    recorder.recordStateChange(puzzleState, '推演开始');
  }, [puzzleState]);

  const stopRecording = useCallback((): string | null => {
    const recorder = getRecorder();
    if (recorder.getEvents().length === 0) return null;
    const replayId = saveReplay(recorder, puzzleState.score);
    resetRecorder();
    setReplayList(getReplayList());
    return replayId;
  }, [puzzleState.score]);

  const startReplay = useCallback((replayId: string): boolean => {
    clearPlaybackTimer();
    const events = getReplay(replayId);
    if (!events || events.length === 0) return false;

    setState({
      isReplaying: true,
      isPaused: false,
      currentEventIndex: 0,
      playbackSpeed: 1,
      events,
      replayId,
    });
    return true;
  }, [clearPlaybackTimer]);

  const play = useCallback(() => {
    if (!state.isReplaying || state.isPaused) return;

    const events = state.events;
    const currentIndex = state.currentEventIndex;

    if (currentIndex >= events.length) {
      setState(prev => ({ ...prev, isReplaying: false, isPaused: false }));
      return;
    }

    const delay = 1000 / state.playbackSpeed;

    playbackTimerRef.current = window.setTimeout(() => {
      setState(prev => ({
        ...prev,
        currentEventIndex: prev.currentEventIndex + 1,
      }));
      play();
    }, delay);
  }, [state.isReplaying, state.isPaused, state.currentEventIndex, state.events, state.playbackSpeed]);

  const pause = useCallback(() => {
    clearPlaybackTimer();
    setState(prev => ({ ...prev, isPaused: true }));
  }, [clearPlaybackTimer]);

  const resume = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const stop = useCallback(() => {
    clearPlaybackTimer();
    setState(initialState);
  }, [clearPlaybackTimer]);

  const setSpeed = useCallback((speed: number) => {
    setState(prev => ({ ...prev, playbackSpeed: Math.max(0.25, Math.min(4, speed)) }));
  }, []);

  const seekTo = useCallback((eventIndex: number) => {
    clearPlaybackTimer();
    setState(prev => ({
      ...prev,
      currentEventIndex: Math.max(0, Math.min(eventIndex, prev.events.length - 1)),
    }));
  }, [clearPlaybackTimer]);

  const getCurrentEvent = useCallback((): RecordedEvent | null => {
    if (!state.isReplaying || state.currentEventIndex >= state.events.length) {
      return null;
    }
    return state.events[state.currentEventIndex];
  }, [state.isReplaying, state.currentEventIndex, state.events]);

  const deleteReplayRecord = useCallback((replayId: string) => {
    const list = getReplayList().filter(m => m.id !== replayId);
    localStorage.setItem('infection_outbreak_replay_list', JSON.stringify(list));
    setReplayList(list);
  }, []);

  React.useEffect(() => {
    if (state.isReplaying && !state.isPaused) {
      play();
    }
    return () => clearPlaybackTimer();
  }, [state.isReplaying, state.isPaused, play, clearPlaybackTimer]);

  return (
    <ReplayContext.Provider
      value={{
        state,
        replayList,
        startReplay,
        startRecording,
        stopRecording,
        play,
        pause,
        resume,
        stop,
        setSpeed,
        seekTo,
        getCurrentEvent,
        deleteReplayRecord,
      }}
    >
      {children}
    </ReplayContext.Provider>
  );
}

export function useReplay() {
  const context = useContext(ReplayContext);
  if (context === undefined) {
    throw new Error('useReplay must be used within a ReplayProvider');
  }
  return context;
}