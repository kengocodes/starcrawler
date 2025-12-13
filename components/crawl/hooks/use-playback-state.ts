"use client";

import { useReducer, useRef, useCallback } from "react";
import type {
  PlaybackState,
  PlaybackAction,
  TimingRefs,
  AnimationPhase,
} from "./types";

const initialPlaybackState: PlaybackState = {
  phase: "opening-text",
  isComplete: false,
  crawlStarted: false,
  animationStarted: false,
};

function playbackReducer(
  state: PlaybackState,
  action: PlaybackAction
): PlaybackState {
  switch (action.type) {
    case "SET_PHASE":
      return { ...state, phase: action.phase };
    case "START_CRAWL":
      return { ...state, crawlStarted: true };
    case "START_ANIMATION":
      return { ...state, animationStarted: true };
    case "COMPLETE":
      return { ...state, isComplete: true };
    case "RESET":
      return initialPlaybackState;
    default:
      return state;
  }
}

/**
 * Creates timing refs for tracking mutable state without causing re-renders
 */
function useTimingRefs(): TimingRefs {
  return {
    // Overall timing
    overallStartTime: useRef<number | null>(null),
    overallPausedTime: useRef(0),
    overallPauseStart: useRef<number | null>(null),
    // Phase timing
    phaseStartTime: useRef<number | null>(null),
    phasePausedTime: useRef(0),
    phasePauseStart: useRef<number | null>(null),
    // Crawl-specific timing
    crawlStartTime: useRef<number | null>(null),
    crawlPausedTime: useRef(0),
    crawlPauseStart: useRef<number | null>(null),
    // Progress tracking
    currentProgress: useRef(0),
    // Completion guard
    hasCompleted: useRef(false),
  };
}

/**
 * Resets all timing refs to initial values
 */
function resetTimingRefs(refs: TimingRefs): void {
  refs.overallStartTime.current = null;
  refs.overallPausedTime.current = 0;
  refs.overallPauseStart.current = null;
  refs.phaseStartTime.current = null;
  refs.phasePausedTime.current = 0;
  refs.phasePauseStart.current = null;
  refs.crawlStartTime.current = null;
  refs.crawlPausedTime.current = 0;
  refs.crawlPauseStart.current = null;
  refs.currentProgress.current = 0;
  refs.hasCompleted.current = false;
}

export interface UsePlaybackStateReturn {
  state: PlaybackState;
  timingRefs: TimingRefs;
  setPhase: (phase: AnimationPhase) => void;
  startCrawl: () => void;
  startAnimation: () => void;
  markComplete: () => void;
  reset: () => void;
  resetTimingRefs: () => void;
}

/**
 * Hook to manage playback state and timing refs
 * Combines reducer for state with refs for mutable timing data
 */
export function usePlaybackState(): UsePlaybackStateReturn {
  const [state, dispatch] = useReducer(playbackReducer, initialPlaybackState);
  const timingRefs = useTimingRefs();

  const setPhase = useCallback((phase: AnimationPhase) => {
    dispatch({ type: "SET_PHASE", phase });
  }, []);

  const startCrawl = useCallback(() => {
    dispatch({ type: "START_CRAWL" });
  }, []);

  const startAnimation = useCallback(() => {
    dispatch({ type: "START_ANIMATION" });
  }, []);

  const markComplete = useCallback(() => {
    // Guard against multiple completions
    if (timingRefs.hasCompleted.current) return;
    timingRefs.hasCompleted.current = true;
    dispatch({ type: "COMPLETE" });
  }, [timingRefs]);

  const reset = useCallback(() => {
    resetTimingRefs(timingRefs);
    dispatch({ type: "RESET" });
  }, [timingRefs]);

  const resetRefs = useCallback(() => {
    resetTimingRefs(timingRefs);
  }, [timingRefs]);

  return {
    state,
    timingRefs,
    setPhase,
    startCrawl,
    startAnimation,
    markComplete,
    reset,
    resetTimingRefs: resetRefs,
  };
}



