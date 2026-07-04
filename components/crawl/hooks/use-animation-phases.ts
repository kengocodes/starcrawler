"use client";

import { useEffect } from "react";
import type { AnimationControls } from "./types";
import { CRAWL_CONSTANTS } from "@/lib/constants";
import type { AnimationDurations, TimingRefs, AnimationPhase } from "./types";

interface UseAnimationPhasesParams {
  isPlaying: boolean;
  isPaused: boolean;
  phase: AnimationPhase;
  crawlStarted: boolean;
  durations: AnimationDurations;
  timingRefs: TimingRefs;
  controls: AnimationControls;
  onPhaseChange: (phase: AnimationPhase) => void;
  onStartCrawl: () => void;
  onReset: () => void;
}

/**
 * Hook to manage animation phase transitions
 * Handles timing for opening-text → logo → crawl phases
 */
export function useAnimationPhases({
  isPlaying,
  isPaused,
  phase,
  crawlStarted,
  durations,
  timingRefs,
  controls,
  onPhaseChange,
  onStartCrawl,
  onReset,
}: UseAnimationPhasesParams): void {
  // Reset everything when playback stops
  useEffect(() => {
    if (!isPlaying) {
      onReset();
      controls.stop();
      controls.set({ y: CRAWL_CONSTANTS.CRAWL_START_POSITION });
    }
  }, [isPlaying, onReset, controls]);

  // Handle phase transitions
  useEffect(() => {
    if (!isPlaying) return;

    // Skip if in crawl phase - the crawl animation manages its own timing refs,
    // and completion is detected by useProgressTracking (which re-reads the
    // timing refs every tick, so it stays correct across seeks and pauses).
    if (phase === "crawl" && crawlStarted) return;

    // Initialize phase start time if not set
    if (timingRefs.phaseStartTime.current === null) {
      timingRefs.phaseStartTime.current = Date.now();
    }

    // Handle pause tracking
    if (isPaused) {
      if (timingRefs.phasePauseStart.current === null) {
        timingRefs.phasePauseStart.current = Date.now();
      }
      return; // Don't set timers when paused
    }

    // Resume: accumulate paused time
    if (timingRefs.phasePauseStart.current !== null) {
      const pauseDuration = Date.now() - timingRefs.phasePauseStart.current;
      timingRefs.phasePausedTime.current += pauseDuration;
      timingRefs.phasePauseStart.current = null;
    }

    // Calculate elapsed time accounting for pauses
    const elapsed = timingRefs.phaseStartTime.current
      ? (Date.now() -
          timingRefs.phaseStartTime.current -
          timingRefs.phasePausedTime.current) /
        1000
      : 0;

    // Opening text phase
    if (phase === "opening-text") {
      const remaining = Math.max(0, durations.openingText - elapsed);

      if (remaining <= 0) {
        transitionToPhase("logo");
        return;
      }

      const timer = setTimeout(() => {
        transitionToPhase("logo");
      }, remaining * 1000);

      return () => clearTimeout(timer);
    }

    // Logo phase - start crawl text 3 seconds before logo finishes
    if (phase === "logo") {
      const remaining = Math.max(0, durations.logo - elapsed);

      // Start crawl animation early (3 seconds before logo ends)
      const crawlStartDelay = Math.max(0, remaining - 3);
      const crawlStartTimer = setTimeout(() => {
        onStartCrawl();
      }, crawlStartDelay * 1000);

      if (remaining <= 0) {
        transitionToPhase("crawl");
        return () => clearTimeout(crawlStartTimer);
      }

      const phaseTimer = setTimeout(() => {
        transitionToPhase("crawl");
      }, remaining * 1000);

      return () => {
        clearTimeout(crawlStartTimer);
        clearTimeout(phaseTimer);
      };
    }

    function transitionToPhase(newPhase: AnimationPhase) {
      onPhaseChange(newPhase);
      timingRefs.phaseStartTime.current = Date.now();
      timingRefs.phasePausedTime.current = 0;
    }
  }, [
    isPlaying,
    isPaused,
    phase,
    crawlStarted,
    durations,
    timingRefs,
    onPhaseChange,
    onStartCrawl,
  ]);
}

