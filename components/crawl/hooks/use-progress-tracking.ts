"use client";

import { useEffect } from "react";
import type { AnimationControls } from "./types";
import type { AnimationDurations, TimingRefs, AnimationPhase } from "./types";
import { calculateOpacity } from "./use-crawl-animation";

interface UseProgressTrackingParams {
  isPlaying: boolean;
  isPaused: boolean;
  isComplete: boolean;
  phase: AnimationPhase;
  crawlStarted: boolean;
  durations: AnimationDurations;
  timingRefs: TimingRefs;
  controls: AnimationControls;
  onProgressChange?: (progress: number, elapsed: number, remaining: number) => void;
  onComplete: () => void;
}

/**
 * Hook to track and report animation progress
 * Updates progress at regular intervals, handles opacity fading, and fires
 * completion when the crawl animation reaches its full duration. Detecting
 * completion here (instead of a one-shot timer) keeps it correct across
 * seeks and pauses, since the timing refs are re-read on every tick.
 */
export function useProgressTracking({
  isPlaying,
  isPaused,
  isComplete,
  phase,
  crawlStarted,
  durations,
  timingRefs,
  controls,
  onProgressChange,
  onComplete,
}: UseProgressTrackingParams): void {
  // Initialize overall timing when playback starts
  useEffect(() => {
    if (isPlaying && timingRefs.overallStartTime.current === null) {
      timingRefs.overallStartTime.current = Date.now();
    }
    if (!isPlaying) {
      timingRefs.overallStartTime.current = null;
      timingRefs.overallPausedTime.current = 0;
      timingRefs.overallPauseStart.current = null;
      timingRefs.hasCompleted.current = false;
    }
  }, [isPlaying, timingRefs]);

  // Track pause time for overall progress
  useEffect(() => {
    if (isPaused && timingRefs.overallPauseStart.current === null) {
      timingRefs.overallPauseStart.current = Date.now();
    } else if (!isPaused && timingRefs.overallPauseStart.current !== null) {
      timingRefs.overallPausedTime.current +=
        Date.now() - timingRefs.overallPauseStart.current;
      timingRefs.overallPauseStart.current = null;
    }
  }, [isPaused, timingRefs]);

  // Report progress at regular intervals and detect completion
  useEffect(() => {
    if (!isPlaying || isComplete || isPaused) return;

    const interval = setInterval(() => {
      if (timingRefs.overallStartTime.current === null) return;

      const overallElapsed = calculateOverallElapsed(timingRefs);
      const overallProgress = Math.min(overallElapsed / durations.total, 1);
      const overallRemaining = Math.max(0, durations.total - overallElapsed);

      // Update crawl-specific progress and opacity
      if (phase === "crawl" && crawlStarted && timingRefs.crawlStartTime.current !== null) {
        const crawlElapsed = calculateCrawlElapsed(timingRefs);
        const crawlProgress = Math.min(crawlElapsed / durations.crawl, 1);
        timingRefs.currentProgress.current = crawlProgress;

        // Update opacity based on progress
        const opacity = calculateOpacity(crawlProgress);
        controls.set({ opacity });

        // The crawl animation has run its full course - fire completion.
        // (onComplete is guarded against firing more than once upstream.)
        if (crawlElapsed >= durations.crawl) {
          onProgressChange?.(1, durations.total, 0);
          onComplete();
          return;
        }
      }

      onProgressChange?.(overallProgress, overallElapsed, overallRemaining);
    }, 100);

    return () => clearInterval(interval);
  }, [
    isPlaying,
    isPaused,
    isComplete,
    phase,
    crawlStarted,
    durations,
    timingRefs,
    controls,
    onProgressChange,
    onComplete,
  ]);
}

/**
 * Calculate overall elapsed time accounting for pauses
 */
function calculateOverallElapsed(timingRefs: TimingRefs): number {
  if (timingRefs.overallStartTime.current === null) return 0;

  const now = Date.now();
  const currentPause = timingRefs.overallPauseStart.current
    ? now - timingRefs.overallPauseStart.current
    : 0;

  return (
    (now -
      timingRefs.overallStartTime.current -
      timingRefs.overallPausedTime.current -
      currentPause) /
    1000
  );
}

/**
 * Calculate crawl phase elapsed time accounting for pauses
 */
function calculateCrawlElapsed(timingRefs: TimingRefs): number {
  if (timingRefs.crawlStartTime.current === null) return 0;

  const now = Date.now();
  const currentPause = timingRefs.crawlPauseStart.current
    ? now - timingRefs.crawlPauseStart.current
    : 0;

  return (
    (now -
      timingRefs.crawlStartTime.current -
      timingRefs.crawlPausedTime.current -
      currentPause) /
    1000
  );
}

