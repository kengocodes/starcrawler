"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Home } from "lucide-react";
import { Starfield } from "@/components/crawl/starfield";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error:", error);
    }
    // In production, you could send to error monitoring service here
  }, [error]);

  return (
    <main className="relative flex min-h-screen flex-col bg-crawl-black">
      <Starfield />

      <div className="relative z-20 flex flex-1 flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl space-y-6 text-center">
          {/* Error Icon/Title */}
          <div className="space-y-3">
            <h1
              className="font-logo text-4xl font-bold uppercase tracking-wider text-crawl-yellow sm:text-5xl md:text-6xl"
              style={{ letterSpacing: "0.15em" }}
            >
              ERROR
            </h1>
            <p
              className="font-opening-text text-base text-gray-300 sm:text-lg"
              style={{ letterSpacing: "0.05em" }}
            >
              Something went wrong
            </p>
          </div>

          {/* Error Message */}
          <div
            className="mx-auto max-w-lg rounded-md border-2 border-red-500/40 bg-red-500/10 px-6 py-4 backdrop-blur-sm"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
            }}
          >
            <p className="font-opening-text text-sm text-red-400 sm:text-base">
              {process.env.NODE_ENV === "development"
                ? error.message || "An unexpected error occurred"
                : "An unexpected error occurred. Please try again."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 border-2 border-crawl-yellow/40 bg-black/80 px-5 py-3 font-crawl text-sm font-bold uppercase tracking-wider text-crawl-yellow backdrop-blur-sm transition-colors hover:border-crawl-yellow hover:bg-crawl-yellow/10 active:bg-crawl-yellow/20 active:scale-95 touch-manipulation cursor-pointer min-h-[44px]"
              style={{
                letterSpacing: "0.1em",
                clipPath:
                  "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                touchAction: "manipulation",
              }}
              aria-label="Try again"
            >
              <RotateCcw className="size-4 shrink-0" />
              <span>Try Again</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 border-2 border-crawl-yellow/40 bg-black/80 px-5 py-3 font-crawl text-sm font-bold uppercase tracking-wider text-crawl-yellow backdrop-blur-sm transition-colors hover:border-crawl-yellow hover:bg-crawl-yellow/10 active:bg-crawl-yellow/20 active:scale-95 touch-manipulation cursor-pointer min-h-[44px]"
              style={{
                letterSpacing: "0.1em",
                clipPath:
                  "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                touchAction: "manipulation",
              }}
            >
              <Home className="size-4 shrink-0" />
              <span>Go Home</span>
            </Link>
          </div>

          {/* Help Text */}
          <p
            className="font-opening-text text-xs text-gray-400 sm:text-sm"
            style={{ letterSpacing: "0.05em" }}
          >
            If this problem persists, please refresh the page or try again
            later.
          </p>
        </div>
      </div>
    </main>
  );
}
