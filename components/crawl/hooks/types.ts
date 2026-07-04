import type { useAnimation } from "motion/react";
import type { CrawlData } from "@/lib/types";

/**
 * Animation controls type from Motion's useAnimation hook
 */
export type AnimationControls = ReturnType<typeof useAnimation>;

/**
 * Animation phases for the crawl display
 */
export type AnimationPhase = "opening-text" | "logo" | "crawl";

/**
 * Durations for each animation phase (in seconds)
 */
export interface AnimationDurations {
  openingText: number;
  logo: number;
  crawl: number;
  total: number;
}

/**
 * Timing state for tracking elapsed and paused time
 */
export interface TimingState {
  startTime: number | null;
  pausedTime: number;
  pauseStartTime: number | null;
}

/**
 * Progress information for the animation
 */
export interface ProgressInfo {
  progress: number;      // 0-1 overall progress
  elapsed: number;       // seconds elapsed
  remaining: number;     // seconds remaining
  crawlProgress: number; // 0-1 progress within crawl phase
}

/**
 * Playback state combining all animation state
 */
export interface PlaybackState {
  phase: AnimationPhase;
  isComplete: boolean;
  crawlStarted: boolean;
  animationStarted: boolean;
}

/**
 * Actions for playback state reducer
 */
export type PlaybackAction =
  | { type: "SET_PHASE"; phase: AnimationPhase }
  | { type: "START_CRAWL" }
  | { type: "START_ANIMATION" }
  | { type: "COMPLETE" }
  | { type: "RESET" };

/**
 * Refs for tracking mutable timing state (avoids re-renders)
 */
export interface TimingRefs {
  // Overall timing
  overallStartTime: React.MutableRefObject<number | null>;
  overallPausedTime: React.MutableRefObject<number>;
  overallPauseStart: React.MutableRefObject<number | null>;
  // Phase timing
  phaseStartTime: React.MutableRefObject<number | null>;
  phasePausedTime: React.MutableRefObject<number>;
  phasePauseStart: React.MutableRefObject<number | null>;
  // Crawl-specific timing
  crawlStartTime: React.MutableRefObject<number | null>;
  crawlPausedTime: React.MutableRefObject<number>;
  crawlPauseStart: React.MutableRefObject<number | null>;
  // Progress tracking
  currentProgress: React.MutableRefObject<number>;
  // Completion guard
  hasCompleted: React.MutableRefObject<boolean>;
}

/**
 * Configuration for the crawl animation
 */
export interface CrawlAnimationConfig {
  startPosition: string;
  endPosition: string;
  fadeStart: number;
  fadeEnd: number;
}

/**
 * Props for animation phase components
 */
export interface OpeningTextPhaseProps {
  text: string;
}

export interface LogoPhaseProps {
  text: string;
  duration: number;
  isPaused?: boolean;
  /** Seconds already elapsed in the logo phase (nonzero when mounting mid-phase after a seek) */
  startOffset?: number;
}

export interface CrawlTextPhaseProps {
  crawlData: CrawlData;
  controls: AnimationControls;
  isVisible: boolean;
  zIndex: number;
}

/**
 * Seek target information
 */
export interface SeekTarget {
  phase: AnimationPhase;
  phaseProgress: number;
  crawlProgress: number;
  overallTime: number;
}

