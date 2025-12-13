"use client";

import { motion } from "framer-motion";

interface LogoPhaseProps {
  text: string;
  duration: number;
}

/**
 * Logo phase - displays the logo text that shrinks and recedes
 */
export function LogoPhase({ text, duration }: LogoPhaseProps) {
  return (
    <motion.div
      className="absolute inset-0 z-20 flex items-center justify-center"
      initial={{ scale: 3.5, opacity: 1, y: 0 }}
      animate={{
        scale: 0.1,
        y: -150,
        opacity: 0,
      }}
      transition={{
        duration,
        ease: [0.25, 0.1, 0.25, 1],
        opacity: {
          duration: duration * 0.5,
          delay: duration * 0.5,
          ease: "easeIn",
        },
      }}
      style={{
        transformStyle: "preserve-3d",
        transformOrigin: "center center",
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
    </motion.div>
  );
}



