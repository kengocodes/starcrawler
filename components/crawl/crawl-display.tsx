"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAnimation } from "motion/react";
import { X } from "lucide-react";

import { CRAWL_CONSTANTS } from "@/lib/constants";
import { FadeMask } from "@/components/crawl/fade-mask";
import { Button } from "@/components/ui/button";
import type { CrawlDisplayProps } from "@/lib/types";

// Hooks
import {
  useAnimationDurations,
  usePlaybackState,
  useAnimationPhases,
  useCrawlAnimation,
  useProgressTracking,
  useSeek,
  useInteractionHandlers,
} from "./hooks";

// Phase components
import { OpeningTextPhase, LogoPhase, CrawlTextPhase } from "./phases";

/**
 * CrawlDisplay - Renders the animated opening crawl
 *
 * This component orchestrates a three-phase animation:
 * 1. Opening text ("A long time ago...")
 * 2. Logo (shrinks and recedes into distance)
 * 3. Crawl text (scrolls with perspective)
 *
 * Features:
 * - Pause/resume support
 * - Seeking to any position
 * - Progress tracking
 * - Touch and click interaction handling
 * - Reduced motion support
 */
export function CrawlDisplay({
  crawlData,
  isPlaying,
  isPaused = false,
  onComplete,
  onProgressChange,
  seekTo,
  onPause,
  onResume,
  onClose,
  controlsVisible = false,
  onControlsVisibilityChange,
  onPhaseChange,
}: CrawlDisplayProps) {
  const controls = useAnimation();
  const durations = useAnimationDurations();
  const previousCrawlDataRef = useRef(crawlData);

  const {
    state,
    timingRefs,
    setPhase,
    startCrawl,
    startAnimation,
    markComplete,
    reset,
    resetTimingRefs,
  } = usePlaybackState();

  // Notify parent of phase changes
  useEffect(() => {
    onPhaseChange?.(state.phase);
  }, [state.phase, onPhaseChange]);

  // Handle completion with callback
  const handleComplete = useCallback(() => {
    markComplete();
    onComplete?.();
  }, [markComplete, onComplete]);

  // Reset state for seek operations (without full reset)
  const handleResetForSeek = useCallback(() => {
    resetTimingRefs();
  }, [resetTimingRefs]);

  // Phase management
  useAnimationPhases({
    isPlaying,
    isPaused,
    phase: state.phase,
    crawlStarted: state.crawlStarted,
    isComplete: state.isComplete,
    durations,
    timingRefs,
    controls,
    onPhaseChange: setPhase,
    onStartCrawl: startCrawl,
    onComplete: handleComplete,
    onReset: reset,
  });

  // Crawl animation
  useCrawlAnimation({
    isPlaying,
    isPaused,
    phase: state.phase,
    crawlStarted: state.crawlStarted,
    animationStarted: state.animationStarted,
    durations,
    timingRefs,
    controls,
    onStartAnimation: startAnimation,
  });

  // Progress tracking
  useProgressTracking({
    isPlaying,
    isPaused,
    isComplete: state.isComplete,
    phase: state.phase,
    crawlStarted: state.crawlStarted,
    durations,
    timingRefs,
    controls,
    onProgressChange,
  });

  // Seeking
  useSeek({
    seekTo,
    isPlaying,
    isPaused,
    durations,
    timingRefs,
    controls,
    onPhaseChange: setPhase,
    onStartCrawl: startCrawl,
    onStartAnimation: startAnimation,
    onComplete: handleComplete,
    onResetState: handleResetForSeek,
  });

  // Interaction handling (pause on click/tap)
  useInteractionHandlers({
    isPlaying,
    isPaused,
    controlsVisible,
    onPause,
    onResume,
    onControlsVisibilityChange,
  });

  // Reset when crawlData changes
  useEffect(() => {
    const hasChanged =
      previousCrawlDataRef.current !== crawlData &&
      (previousCrawlDataRef.current === null ||
        crawlData === null ||
        JSON.stringify(previousCrawlDataRef.current) !==
          JSON.stringify(crawlData));

    if (hasChanged) {
      reset();
      controls.set({ y: CRAWL_CONSTANTS.CRAWL_START_POSITION, opacity: 1 });
      previousCrawlDataRef.current = crawlData;
    }
  }, [crawlData, controls, reset]);

  // Don't render if not playing
  if (!isPlaying) {
    return null;
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-10 cursor-pointer overflow-hidden"
      style={{
        perspective: CRAWL_CONSTANTS.PERSPECTIVE,
        perspectiveOrigin: "50% 50%",
        touchAction: "manipulation",
      }}
      aria-live="polite"
      aria-label="Opening crawl animation"
    >
      {/* Close Button */}
      {onClose && (
        <CloseButton onClick={handleClose} visible={controlsVisible} />
      )}

      {/* Fade masks for top/bottom */}
      <FadeMask position="top" />
      <FadeMask position="bottom" />

      {/* Phase-specific content */}
      {state.phase === "opening-text" && (
        <OpeningTextPhase text={crawlData.openingText} />
      )}

      {state.phase === "logo" && (
        <LogoPhase text={crawlData.logoText} duration={durations.logo} />
      )}

      <CrawlTextPhase
        crawlData={crawlData}
        controls={controls}
        isVisible={state.crawlStarted || state.phase === "crawl"}
        zIndex={state.phase === "logo" ? 10 : 20}
      />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

interface CloseButtonProps {
  onClick: (e: React.MouseEvent) => void;
  visible: boolean;
}

function CloseButton({ onClick, visible }: CloseButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={`fixed left-4 top-4 z-50 h-12 w-12 min-h-[44px] min-w-[44px] border-2 border-crawl-yellow/50 bg-black/90 p-0 text-crawl-yellow/90 shadow-lg shadow-black/50 backdrop-blur-md transition-all duration-300 hover:border-crawl-yellow hover:bg-crawl-yellow/15 hover:text-crawl-yellow focus-visible:ring-2 focus-visible:ring-crawl-yellow active:scale-95 touch-manipulation sm:left-auto sm:right-4 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      style={{ touchAction: "manipulation" }}
      aria-label="Close crawl and return to form"
      title="Close (Esc)"
    >
      <X className="size-6" />
    </Button>
  );
}
