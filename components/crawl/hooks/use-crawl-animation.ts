"use client";

import { useEffect } from "react";
import type { AnimationControls } from "./types";
import { CRAWL_CONSTANTS } from "@/lib/constants";
import type { AnimationDurations, TimingRefs, AnimationPhase } from "./types";

// Crawl animation configuration
const FADE_START = 0.7;
const FADE_END = 1.0;

/**
 * Calculate opacity based on crawl progress (fade out near end)
 */
export function calculateOpacity(crawlProgress: number): number {
  if (crawlProgress >= FADE_START) {
    const fadeProgress = (crawlProgress - FADE_START) / (FADE_END - FADE_START);
    return Math.max(0, 1 - fadeProgress);
  }
  return 1;
}

/**
 * Calculate Y position based on crawl progress
 */
export function calculateYPosition(crawlProgress: number): number {
  const startY = parseFloat(CRAWL_CONSTANTS.CRAWL_START_POSITION);
  const endY = parseFloat(CRAWL_CONSTANTS.CRAWL_END_POSITION);
  return startY + (endY - startY) * crawlProgress;
}

interface UseCrawlAnimationParams {
  isPlaying: boolean;
  isPaused: boolean;
  phase: AnimationPhase;
  crawlStarted: boolean;
  animationStarted: boolean;
  durations: AnimationDurations;
  timingRefs: TimingRefs;
  controls: AnimationControls;
  onStartAnimation: () => void;
}

/**
 * Hook to manage the crawl text animation
 * Handles starting, pausing, and resuming the crawl animation
 */
export function useCrawlAnimation({
  isPlaying,
  isPaused,
  phase,
  crawlStarted,
  animationStarted,
  durations,
  timingRefs,
  controls,
  onStartAnimation,
}: UseCrawlAnimationParams): void {
  // Start crawl animation when conditions are met
  useEffect(() => {
    const shouldStart =
      (crawlStarted || phase === "crawl") &&
      isPlaying &&
      !animationStarted &&
      !isPaused;

    if (shouldStart) {
      onStartAnimation();
      timingRefs.currentProgress.current = 0;
      timingRefs.crawlStartTime.current = Date.now();
      timingRefs.crawlPausedTime.current = 0;
      timingRefs.crawlPauseStart.current = null;

      // Reset to starting position
      controls.set({ y: CRAWL_CONSTANTS.CRAWL_START_POSITION, opacity: 1 });

      // Start animation
      controls.start({
        y: CRAWL_CONSTANTS.CRAWL_END_POSITION,
        opacity: 0,
        transition: {
          duration: durations.crawl,
          ease: "linear",
        },
      });
    }
  }, [
    crawlStarted,
    phase,
    isPlaying,
    isPaused,
    animationStarted,
    durations.crawl,
    timingRefs,
    controls,
    onStartAnimation,
  ]);

  // Handle pause/resume for crawl animation.
  // Note: no phase check here - the crawl animation starts a few seconds
  // before the logo phase ends, so it must pause/resume during that overlap
  // too (otherwise it keeps scrolling while "paused" and its pause time is
  // never accounted for).
  useEffect(() => {
    if (!crawlStarted || !animationStarted) return;

    if (isPaused) {
      // Pause: stop animation and track pause start time
      controls.stop();
      if (timingRefs.crawlPauseStart.current === null) {
        timingRefs.crawlPauseStart.current = Date.now();
      }
    } else {
      // Resume: calculate elapsed time and continue from current position
      if (timingRefs.crawlPauseStart.current !== null) {
        const pauseDuration = Date.now() - timingRefs.crawlPauseStart.current;
        timingRefs.crawlPausedTime.current += pauseDuration;
        timingRefs.crawlPauseStart.current = null;
      }

      const elapsed = timingRefs.crawlStartTime.current
        ? (Date.now() -
            timingRefs.crawlStartTime.current -
            timingRefs.crawlPausedTime.current) /
          1000
        : 0;

      const progress = Math.min(elapsed / durations.crawl, 1);
      timingRefs.currentProgress.current = progress;

      const remainingDuration = durations.crawl * (1 - progress);
      const currentY = calculateYPosition(progress);
      const opacity = calculateOpacity(progress);

      // Resume from current position
      controls.set({ y: `${currentY}%`, opacity });
      controls.start({
        y: CRAWL_CONSTANTS.CRAWL_END_POSITION,
        opacity,
        transition: {
          duration: remainingDuration,
          ease: "linear",
        },
      });
    }
  }, [
    isPaused,
    crawlStarted,
    animationStarted,
    durations.crawl,
    timingRefs,
    controls,
  ]);
}

