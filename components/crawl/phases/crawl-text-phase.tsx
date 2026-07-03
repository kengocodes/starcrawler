"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import type { AnimationControls } from "../hooks/types";
import { CRAWL_CONSTANTS } from "@/lib/constants";
import type { CrawlData } from "@/lib/types";

interface CrawlTextPhaseProps {
  crawlData: CrawlData;
  controls: AnimationControls;
  isVisible: boolean;
  zIndex: number;
}

/**
 * Format crawl text into paragraphs
 */
function formatParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0)
    .map((p) => p.trim());
}

/**
 * Crawl text phase - displays the scrolling crawl text
 */
export function CrawlTextPhase({
  crawlData,
  controls,
  isVisible,
  zIndex,
}: CrawlTextPhaseProps) {
  const paragraphs = useMemo(
    () => formatParagraphs(crawlData.crawlText),
    [crawlData.crawlText]
  );

  if (!isVisible) return null;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        transform: `rotateX(${CRAWL_CONSTANTS.ROTATION}deg)`,
        transformOrigin: "50% 100%",
        transformStyle: "preserve-3d",
        zIndex,
      }}
    >
      <motion.div
        className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16"
        animate={controls}
        initial={{ y: CRAWL_CONSTANTS.CRAWL_START_POSITION, opacity: 1 }}
        style={{
          willChange: "transform, opacity",
          maxWidth: "min(90vw, 1200px)",
        }}
      >
        <div
          className="space-y-6 font-crawl text-crawl-yellow"
          style={{
            fontSize: CRAWL_CONSTANTS.FONT_SIZE_BASE,
            lineHeight: CRAWL_CONSTANTS.LINE_HEIGHT,
            letterSpacing: CRAWL_CONSTANTS.LETTER_SPACING,
          }}
        >
          {/* Episode Number */}
          {crawlData.episodeNumber && (
            <EpisodeNumber number={crawlData.episodeNumber} />
          )}

          {/* Episode Subtitle */}
          {crawlData.episodeSubtitle && (
            <EpisodeSubtitle subtitle={crawlData.episodeSubtitle} />
          )}

          {/* Crawl Text Paragraphs */}
          {paragraphs.map((paragraph, index) => (
            <CrawlParagraph key={index} text={paragraph} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function EpisodeNumber({ number }: { number: string }) {
  return (
    <div
      style={{
        fontSize: CRAWL_CONSTANTS.FONT_SIZE_EPISODE,
        marginBottom: CRAWL_CONSTANTS.PARAGRAPH_SPACING,
        textTransform: "uppercase",
        fontWeight: 700,
        textAlign: "center",
      }}
    >
      EPISODE {number}
    </div>
  );
}

function EpisodeSubtitle({ subtitle }: { subtitle: string }) {
  return (
    <div
      style={{
        fontSize: CRAWL_CONSTANTS.FONT_SIZE_TITLE,
        marginBottom: CRAWL_CONSTANTS.PARAGRAPH_SPACING,
        textTransform: "uppercase",
        fontWeight: 700,
        textAlign: "center",
      }}
    >
      {subtitle}
    </div>
  );
}

function CrawlParagraph({ text }: { text: string }) {
  return (
    <p
      style={{
        marginBottom: CRAWL_CONSTANTS.PARAGRAPH_SPACING,
        textAlign: "justify",
        textAlignLast: "left",
        hyphens: "auto",
        WebkitHyphens: "auto",
        msHyphens: "auto",
      }}
    >
      {text}
    </p>
  );
}

