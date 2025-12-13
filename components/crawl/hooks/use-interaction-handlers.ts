"use client";

import { useEffect, useCallback, useRef } from "react";

interface UseInteractionHandlersParams {
  isPlaying: boolean;
  isPaused: boolean;
  controlsVisible: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onControlsVisibilityChange?: (visible: boolean) => void;
}

/**
 * Check if an element is interactive (should not trigger pause/play)
 */
function isInteractiveElement(target: HTMLElement): boolean {
  return !!(
    target.closest("button") ||
    target.closest('[role="button"]') ||
    target.closest("input") ||
    target.closest("textarea") ||
    target.closest('[role="slider"]') ||
    target.closest("[data-controls-area]")
  );
}

/**
 * Hook to handle touch and click interactions for pause/play
 * Implements YouTube-like behavior:
 * - Mobile: first tap shows controls, subsequent taps toggle pause/play
 * - Desktop: clicks always toggle pause/play
 */
export function useInteractionHandlers({
  isPlaying,
  isPaused,
  controlsVisible,
  onPause,
  onResume,
  onControlsVisibilityChange,
}: UseInteractionHandlersParams): void {
  const controlsShownOnceRef = useRef(false);

  // Reset flag when playback state or controls visibility changes
  useEffect(() => {
    if (!isPlaying) {
      controlsShownOnceRef.current = false;
      return;
    }

    // Mark as shown if controls are visible when playback starts
    if (controlsVisible && !controlsShownOnceRef.current) {
      controlsShownOnceRef.current = true;
    }

    // Reset flag when controls auto-hide (like YouTube)
    if (!controlsVisible) {
      controlsShownOnceRef.current = false;
    }
  }, [isPlaying, controlsVisible]);

  // Handle interaction (touch or click)
  const handleInteraction = useCallback(
    (e: TouchEvent | MouseEvent, isTouch: boolean) => {
      if (!isPlaying) return;

      const target = e.target as HTMLElement;

      // Ignore interactions on controls or interactive elements
      if (isInteractiveElement(target)) return;

      if (isTouch) {
        // Prevent synthetic click and double-firing on mobile
        e.preventDefault();
      }

      // Show controls
      onControlsVisibilityChange?.(true);

      // Mobile: first tap only shows controls
      if (isTouch) {
        const isFirstTap = !controlsShownOnceRef.current;
        if (isFirstTap) {
          controlsShownOnceRef.current = true;
          return;
        }
      }

      // Toggle pause/play
      if (isPaused) {
        onResume?.();
      } else {
        onPause?.();
      }
    },
    [isPlaying, isPaused, onPause, onResume, onControlsVisibilityChange]
  );

  // Global touch handler for mobile
  useEffect(() => {
    if (!isPlaying) return;

    const handleTouchStart = (e: TouchEvent) => {
      handleInteraction(e, true);
    };

    document.addEventListener("touchstart", handleTouchStart, {
      capture: true,
      passive: false,
    });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart, {
        capture: true,
      } as EventListenerOptions);
    };
  }, [isPlaying, handleInteraction]);

  // Global click handler for desktop
  useEffect(() => {
    if (!isPlaying) return;

    const handleClick = (e: MouseEvent) => {
      // Only handle clicks on desktop (not touch devices)
      if (window.matchMedia("(pointer: fine)").matches) {
        handleInteraction(e, false);
      }
    };

    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleClick, {
        capture: true,
      } as EventListenerOptions);
    };
  }, [isPlaying, handleInteraction]);
}



