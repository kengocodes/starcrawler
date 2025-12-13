"use client";

import { useMemo } from "react";
import { CRAWL_CONSTANTS } from "@/lib/constants";
import type { AnimationDurations } from "./types";

/**
 * Hook to compute animation durations based on reduced motion preference
 */
export function useAnimationDurations(): AnimationDurations {
  const shouldReduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return useMemo(() => {
    const openingText = shouldReduceMotion
      ? 1
      : CRAWL_CONSTANTS.OPENING_TEXT_DURATION;
    const logo = shouldReduceMotion
      ? 1
      : CRAWL_CONSTANTS.LOGO_ANIMATION_DURATION;
    const crawl = shouldReduceMotion ? 5 : CRAWL_CONSTANTS.DURATION;
    const total = openingText + logo + crawl;

    return { openingText, logo, crawl, total };
  }, [shouldReduceMotion]);
}



