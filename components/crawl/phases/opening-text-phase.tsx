"use client";

import { motion } from "motion/react";
import { CRAWL_CONSTANTS } from "@/lib/constants";

interface OpeningTextPhaseProps {
  text: string;
}

/**
 * Opening text phase - displays the "A long time ago..." text
 */
export function OpeningTextPhase({ text }: OpeningTextPhaseProps) {
  return (
    <motion.div
      className="absolute inset-0 z-20 flex items-center justify-start px-4 md:justify-center md:px-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p
        className="text-left font-opening-text text-3xl md:text-center md:text-4xl lg:text-5xl"
        style={{
          color: CRAWL_CONSTANTS.OPENING_TEXT_COLOR,
          letterSpacing: "0.15em",
          fontWeight: 400,
        }}
      >
        {text}
      </p>
    </motion.div>
  );
}



