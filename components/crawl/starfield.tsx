"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { STARFIELD_CONSTANTS } from "@/lib/constants";

// Generate random stars for a layer - fill the entire screen
function generateStars(count: number, size: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100, // Random horizontal position (0-100%)
    initialY: Math.random() * 120 - 10, // Random starting position including above/below viewport (-10% to 110%)
    size,
  }));
}

// Star layer component
interface StarLayerProps {
  stars: Array<{ id: number; x: number; initialY: number; size: number }>;
  duration: number;
  opacity: number;
}

function StarLayer({ stars, duration, opacity }: StarLayerProps) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        opacity,
      }}
    >
      {stars.map((star) => {
        // Stars move very slowly from top to bottom
        // Start position includes area above viewport, end position includes area below
        const startY = star.initialY; // Use the random initial position
        const endY = star.initialY + 120; // Move down by 120vh (full viewport + buffer)

        return (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${startY}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              willChange: "transform",
            }}
            animate={{
              y: [`${startY}%`, `${endY}%`],
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 0,
            }}
          />
        );
      })}
    </div>
  );
}

export function Starfield() {
  // Generate stars for each layer with different sizes and counts
  // Memoize to prevent regeneration on every render
  const layers = useMemo(
    () => [
      {
        stars: generateStars(
          STARFIELD_CONSTANTS.STAR_COUNTS[0]!,
          STARFIELD_CONSTANTS.STAR_SIZES[0]!
        ), // Small stars - many of them
        duration: STARFIELD_CONSTANTS.ANIMATION_SPEEDS[0]!,
        opacity: 0.9,
      },
      {
        stars: generateStars(
          STARFIELD_CONSTANTS.STAR_COUNTS[1]!,
          STARFIELD_CONSTANTS.STAR_SIZES[1]!
        ), // Medium stars
        duration: STARFIELD_CONSTANTS.ANIMATION_SPEEDS[1]!,
        opacity: 0.7,
      },
      {
        stars: generateStars(
          STARFIELD_CONSTANTS.STAR_COUNTS[2]!,
          STARFIELD_CONSTANTS.STAR_SIZES[2]!
        ), // Large stars
        duration: STARFIELD_CONSTANTS.ANIMATION_SPEEDS[2]!,
        opacity: 0.5,
      },
      {
        stars: generateStars(
          STARFIELD_CONSTANTS.STAR_COUNTS[3]!,
          STARFIELD_CONSTANTS.STAR_SIZES[2]! + 1
        ), // Extra large stars
        duration: STARFIELD_CONSTANTS.ANIMATION_SPEEDS[3]!,
        opacity: 0.4,
      },
    ],
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-crawl-black">
      {layers.map((layer, index) => (
        <StarLayer
          key={index}
          stars={layer.stars}
          duration={layer.duration}
          opacity={layer.opacity}
        />
      ))}
    </div>
  );
}
