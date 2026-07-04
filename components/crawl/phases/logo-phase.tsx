"use client";

import { useEffect, useRef } from "react";
import { useAnimate } from "motion/react";
import type { AnimationPlaybackControls } from "motion/react";
import type { LogoPhaseProps } from "../hooks/types";

// If the phase clock and the animation playhead disagree by more than this
// (in seconds), a seek happened and the playhead is snapped to the clock.
// Normal playback drift stays well below this threshold.
const SEEK_SYNC_THRESHOLD = 0.25;

/**
 * Logo phase - displays the logo text that shrinks and recedes
 *
 * Uses an imperative animation (via useAnimate) instead of a declarative
 * `animate` prop so playback can actually be paused/resumed, and so the
 * playhead can be repositioned after a seek.
 */
export function LogoPhase({
  text,
  duration,
  isPaused = false,
  startOffset = 0,
}: LogoPhaseProps) {
  const [scope, animate] = useAnimate();
  const playbackRef = useRef<AnimationPlaybackControls | null>(null);
  // Captured at mount; later prop changes are handled by the sync effect below
  const initialOffsetRef = useRef(startOffset);

  useEffect(() => {
    const playback = animate(
      scope.current,
      { scale: [3.5, 0.1], y: [0, -150], opacity: [1, 0] },
      {
        duration,
        ease: [0.25, 0.1, 0.25, 1],
        opacity: {
          duration: duration * 0.5,
          delay: duration * 0.5,
          ease: "easeIn",
        },
      }
    );

    // When mounted mid-phase (e.g. after a seek), jump to the right point
    if (initialOffsetRef.current > 0) {
      playback.time = Math.min(initialOffsetRef.current, duration);
    }

    playbackRef.current = playback;
    return () => {
      playback.stop();
      playbackRef.current = null;
    };
  }, [animate, scope, duration]);

  // Pause/resume playback with the rest of the crawl
  useEffect(() => {
    const playback = playbackRef.current;
    if (!playback) return;
    if (isPaused) {
      playback.pause();
    } else {
      playback.play();
    }
  }, [isPaused]);

  // Keep the playhead in sync with the phase clock after seeks within the
  // logo phase (no remount happens in that case, so the mount effect above
  // can't handle it)
  useEffect(() => {
    const playback = playbackRef.current;
    if (!playback) return;
    if (Math.abs(playback.time - startOffset) > SEEK_SYNC_THRESHOLD) {
      playback.time = Math.min(Math.max(0, startOffset), duration);
    }
  }, [startOffset, duration]);

  return (
    <div
      ref={scope}
      className="absolute inset-0 z-20 flex items-center justify-center"
      style={{
        transformStyle: "preserve-3d",
        transformOrigin: "center center",
        // Matches the first keyframe so there is no flash before the
        // animation takes over on mount
        transform: "scale(3.5)",
      }}
    >
      <div
        className="font-logo-hollow text-crawl-yellow"
        style={{
          fontSize: "clamp(4rem, 15vw, 12rem)",
          lineHeight: 1,
          letterSpacing: "0.1em",
          textAlign: "center",
          textTransform: "uppercase",
          fontWeight: 900,
          width: "100vw",
        }}
      >
        {text}
      </div>
    </div>
  );
}
