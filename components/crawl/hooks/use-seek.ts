"use client";

import { useEffect, useRef } from "react";
import type { AnimationControls } from "./types";
import { CRAWL_CONSTANTS } from "@/lib/constants";
import type { AnimationDurations, TimingRefs, AnimationPhase, SeekTarget } from "./types";
import { calculateOpacity, calculateYPosition } from "./use-crawl-animation";

interface UseSeekParams {
  seekTo: number | undefined;
  isPlaying: boolean;
  isPaused: boolean;
  durations: AnimationDurations;
  timingRefs: TimingRefs;
  controls: AnimationControls;
  onPhaseChange: (phase: AnimationPhase) => void;
  onStartCrawl: () => void;
  onStartAnimation: () => void;
  onComplete: () => void;
  onResetState: () => void;
}

/**
 * Hook to handle seeking to different positions in the animation
 */
export function useSeek({
  seekTo,
  isPlaying,
  isPaused,
  durations,
  timingRefs,
  controls,
  onPhaseChange,
  onStartCrawl,
  onStartAnimation,
  onComplete,
  onResetState,
}: UseSeekParams): void {
  // Track last processed seek value to prevent infinite loops
  const lastProcessedSeekRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Guard: skip if no seek value, out of range, not playing, or already processed
    if (seekTo === undefined || seekTo < 0 || seekTo > 1 || !isPlaying) {
      lastProcessedSeekRef.current = undefined;
      return;
    }

    // Skip if we already processed this exact seek value
    if (lastProcessedSeekRef.current === seekTo) {
      return;
    }

    // Mark as processed before making changes
    lastProcessedSeekRef.current = seekTo;

    const seekTarget = calculateSeekTarget(seekTo, durations);

    if (seekTarget.phase === "opening-text") {
      seekToOpeningText(seekTarget, isPaused, durations, timingRefs, controls, onPhaseChange, onResetState);
    } else if (seekTarget.phase === "logo") {
      seekToLogo(seekTarget, isPaused, durations, timingRefs, controls, onPhaseChange, onResetState);
    } else {
      resetTimingForSeek(timingRefs, seekTarget, isPaused);
      seekToCrawl(
        seekTarget,
        isPaused,
        durations,
        timingRefs,
        controls,
        onPhaseChange,
        onStartCrawl,
        onStartAnimation,
        onComplete
      );
    }
  }, [
    seekTo,
    isPlaying,
    isPaused,
    durations,
    timingRefs,
    controls,
    onPhaseChange,
    onStartCrawl,
    onStartAnimation,
    onComplete,
    onResetState,
  ]);
}

/**
 * Calculate which phase and position to seek to
 */
function calculateSeekTarget(seekProgress: number, durations: AnimationDurations): SeekTarget {
  const seekTime = seekProgress * durations.total;

  // Seeking to very start
  if (seekProgress <= 0.001 || seekTime < 0.1) {
    return {
      phase: "opening-text",
      phaseProgress: 0,
      crawlProgress: 0,
      overallTime: 0,
    };
  }

  // Opening text phase
  if (seekTime < durations.openingText) {
    return {
      phase: "opening-text",
      phaseProgress: seekTime / durations.openingText,
      crawlProgress: 0,
      overallTime: seekTime,
    };
  }

  // Logo phase
  if (seekTime < durations.openingText + durations.logo) {
    const logoTime = seekTime - durations.openingText;
    return {
      phase: "logo",
      phaseProgress: logoTime / durations.logo,
      crawlProgress: 0,
      overallTime: seekTime,
    };
  }

  // Crawl phase
  const crawlTime = seekTime - durations.openingText - durations.logo;
  const crawlProgress = Math.max(0, Math.min(1, crawlTime / durations.crawl));
  return {
    phase: "crawl",
    phaseProgress: crawlProgress,
    crawlProgress,
    overallTime: seekTime,
  };
}

/**
 * Reset timing refs for a seek operation
 */
function resetTimingForSeek(
  timingRefs: TimingRefs,
  target: SeekTarget,
  isPaused: boolean
): void {
  const now = Date.now();

  // Reset overall timing. If currently paused, keep tracking the ongoing
  // pause from the seek moment - otherwise the paused time would silently
  // count as elapsed and playback would jump ahead on resume.
  timingRefs.overallStartTime.current = now - target.overallTime * 1000;
  timingRefs.overallPausedTime.current = 0;
  timingRefs.overallPauseStart.current = isPaused ? now : null;

  // Reset completion guard
  timingRefs.hasCompleted.current = false;
}

/**
 * Set the phase clock so that `phaseProgress` of `phaseDuration` has elapsed.
 * If paused, anchor an ongoing pause at the seek moment so the time spent
 * paused after the seek is not counted as elapsed.
 */
function setPhaseTimingForSeek(
  timingRefs: TimingRefs,
  phaseProgress: number,
  phaseDuration: number,
  isPaused: boolean
): void {
  const now = Date.now();
  timingRefs.phaseStartTime.current = now - phaseProgress * phaseDuration * 1000;
  timingRefs.phasePausedTime.current = 0;
  timingRefs.phasePauseStart.current = isPaused ? now : null;
}

function seekToOpeningText(
  target: SeekTarget,
  isPaused: boolean,
  durations: AnimationDurations,
  timingRefs: TimingRefs,
  controls: AnimationControls,
  onPhaseChange: (phase: AnimationPhase) => void,
  onResetState: () => void
): void {
  // Full reset first (clears crawlStarted/animationStarted and all timing
  // refs), then restore the overall clock at the seeked position. Order
  // matters: resetting after would wipe the overall start time and freeze
  // progress reporting.
  onResetState();
  resetTimingForSeek(timingRefs, target, isPaused);
  onPhaseChange("opening-text");

  // durations.openingText is the actual phase duration (it may be shortened
  // by the reduced-motion preference)
  setPhaseTimingForSeek(timingRefs, target.phaseProgress, durations.openingText, isPaused);

  controls.stop();
  controls.set({ y: CRAWL_CONSTANTS.CRAWL_START_POSITION, opacity: 1 });
}

function seekToLogo(
  target: SeekTarget,
  isPaused: boolean,
  durations: AnimationDurations,
  timingRefs: TimingRefs,
  controls: AnimationControls,
  onPhaseChange: (phase: AnimationPhase) => void,
  onResetState: () => void
): void {
  // Full reset first, then restore the overall clock (see seekToOpeningText)
  onResetState();
  resetTimingForSeek(timingRefs, target, isPaused);
  onPhaseChange("logo");

  setPhaseTimingForSeek(timingRefs, target.phaseProgress, durations.logo, isPaused);

  controls.stop();
  controls.set({ y: CRAWL_CONSTANTS.CRAWL_START_POSITION, opacity: 1 });
}

function seekToCrawl(
  target: SeekTarget,
  isPaused: boolean,
  durations: AnimationDurations,
  timingRefs: TimingRefs,
  controls: AnimationControls,
  onPhaseChange: (phase: AnimationPhase) => void,
  onStartCrawl: () => void,
  onStartAnimation: () => void,
  onComplete: () => void
): void {
  onPhaseChange("crawl");
  onStartCrawl();
  onStartAnimation();

  // Set crawl timing. If paused, anchor an ongoing pause at the seek moment
  // so time spent paused after the seek is not counted as elapsed on resume.
  const now = Date.now();
  const crawlElapsed = durations.crawl * target.crawlProgress;
  timingRefs.crawlStartTime.current = now - crawlElapsed * 1000;
  timingRefs.crawlPausedTime.current = 0;
  timingRefs.crawlPauseStart.current = isPaused ? now : null;
  timingRefs.currentProgress.current = target.crawlProgress;

  // Phase timing not used in crawl phase
  timingRefs.phaseStartTime.current = null;
  timingRefs.phasePausedTime.current = 0;
  timingRefs.phasePauseStart.current = null;

  // Calculate position and opacity
  const targetY = calculateYPosition(target.crawlProgress);
  const opacity = calculateOpacity(target.crawlProgress);

  controls.set({ y: `${targetY}%`, opacity });

  const remainingDuration = durations.crawl * (1 - target.crawlProgress);

  if (!isPaused) {
    if (remainingDuration <= 0) {
      onComplete();
    } else {
      controls.start({
        y: CRAWL_CONSTANTS.CRAWL_END_POSITION,
        opacity,
        transition: {
          duration: remainingDuration,
          ease: "linear",
        },
      });
    }
  }
}

