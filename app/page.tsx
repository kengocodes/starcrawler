"use client";

import {
  useState,
  useEffect,
  Suspense,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RotateCcw, Share2, Check } from "lucide-react";
import { motion } from "motion/react";
import { Starfield } from "@/components/crawl/starfield";
import { CrawlInput } from "@/components/crawl/crawl-input";
import { CrawlDisplay } from "@/components/crawl/crawl-display";
import { CrawlControls } from "@/components/crawl/crawl-controls";
import { Footer } from "@/components/ui/footer";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import type { CrawlData } from "@/lib/types";
import {
  decodeCrawlData,
  encodeCrawlData,
  copyToClipboard,
  getBaseUrl,
  isUrlLengthSafe,
} from "@/lib/utils";
import { computeSeekProgress } from "@/lib/utils";
import { UI_CONSTANTS } from "@/lib/constants";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize state immediately from URL to prevent flash
  const initialEncoded = searchParams.get("crawl");
  const initialCrawlData = useMemo(() => {
    if (initialEncoded) {
      return decodeCrawlData(initialEncoded);
    }
    return null;
  }, [initialEncoded]);

  const [crawlData, setCrawlData] = useState<CrawlData | null>(
    initialCrawlData
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lastEncodedUrl, setLastEncodedUrl] = useState<string | null>(
    initialEncoded
  );
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [seekTo, setSeekTo] = useState<number | undefined>(undefined);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [crawlPhase, setCrawlPhase] = useState<
    "opening-text" | "logo" | "crawl"
  >("opening-text");
  const isFormSubmittingRef = useRef(false);

  // Update crawl data when URL changes (only for external/shared links)
  useEffect(() => {
    // Skip if we're in the middle of a form submission
    if (isFormSubmittingRef.current) return;

    const encoded = searchParams.get("crawl");

    // Only reload if URL param changed
    if (encoded === lastEncodedUrl) return;

    if (encoded) {
      const decoded = decodeCrawlData(encoded);
      if (decoded) {
        setCrawlData(decoded);
        setLastEncodedUrl(encoded);
        // Only auto-play if this is a shared link (not our own form submission)
        if (!isPlaying) {
          setIsPlaying(true);
          setIsPaused(false);
        }
      }
    } else {
      // No crawl param - clear data if it was previously loaded from URL
      if (lastEncodedUrl !== null && !isPlaying) {
        setCrawlData(null);
        setIsPlaying(false);
        setLastEncodedUrl(null);
      }
    }
  }, [searchParams, lastEncodedUrl, isPlaying]);

  // Handle form submission
  const handleSubmit = (data: CrawlData) => {
    const encoded = encodeCrawlData(data);
    // Mark that we're submitting to prevent useEffect interference
    isFormSubmittingRef.current = true;

    // Set state first to start playing immediately
    setCrawlData(data);
    setIsPlaying(true);
    setIsPaused(false);
    setLastEncodedUrl(encoded);

    // Update URL after state is set (non-blocking, won't interfere with playback)
    requestAnimationFrame(() => {
      router.replace(`/?crawl=${encoded}`, { scroll: false });
      // Clear the flag after URL update completes
      setTimeout(() => {
        isFormSubmittingRef.current = false;
      }, 100);
    });
  };

  // Handle animation completion (memoized: it's a dependency of the keydown
  // effect below, which would otherwise re-subscribe on every render)
  const handleComplete = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setCrawlPhase("opening-text");
  }, []);

  // Handle pause/resume
  const handlePause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Handle progress updates from CrawlDisplay
  const handleProgressChange = useCallback(
    (newProgress: number, newElapsed: number, newRemaining: number) => {
      setProgress(newProgress);
      setElapsed(newElapsed);
      setRemaining(newRemaining);
    },
    []
  );

  // Handle seeking
  const handleSeek = useCallback(
    (newProgress: number) => {
      setSeekTo(newProgress);
      // Update progress immediately for visual feedback (slider position)
      const totalDuration = elapsed + remaining || 1; // Fallback to 1 to avoid division by zero
      const newElapsed = newProgress * totalDuration;
      const newRemaining = totalDuration - newElapsed;
      setProgress(newProgress);
      setElapsed(newElapsed);
      setRemaining(newRemaining);
      // Clear seekTo after a longer delay to ensure it's processed
      setTimeout(() => {
        setSeekTo(undefined);
      }, 200);
    },
    [elapsed, remaining]
  );

  // Handle fullscreen toggle
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // Silently handle browsers that don't support fullscreen
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    if (!isPlaying || !crawlData) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          if (isPaused) {
            handleResume();
          } else {
            handlePause();
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          // Seek backward 5 seconds
          {
            const backward = computeSeekProgress(progress, elapsed, remaining, -5);
            if (backward !== progress) handleSeek(backward);
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          // Seek forward 5 seconds
          {
            const forward = computeSeekProgress(progress, elapsed, remaining, 5);
            if (forward !== progress) handleSeek(forward);
          }
          break;
        case "f":
        case "F":
          e.preventDefault();
          handleToggleFullscreen();
          break;
        case "Escape":
          // In fullscreen, Escape should only exit fullscreen (handled
          // natively by the browser), not also close the crawl
          if (document.fullscreenElement) break;
          e.preventDefault();
          handleComplete();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isPlaying,
    crawlData,
    isPaused,
    progress,
    elapsed,
    remaining,
    handlePause,
    handleResume,
    handleToggleFullscreen,
    handleSeek,
    handleComplete,
  ]);

  // Reset to input form
  const handleReset = () => {
    setCrawlData(null);
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setElapsed(0);
    setRemaining(0);
    setIsFullscreen(false);
    setSeekTo(undefined);
    setCrawlPhase("opening-text");
    // Clear URL params
    router.replace("/", { scroll: false });
  };

  // Handle URL sharing - copy to clipboard
  const handleShareUrl = useCallback(async () => {
    if (!crawlData) return;

    try {
      const encoded = encodeCrawlData(crawlData);
      const baseUrl = getBaseUrl();

      if (!isUrlLengthSafe(baseUrl, encoded)) {
        return;
      }

      const shareUrl = `${baseUrl}?crawl=${encoded}`;
      const success = await copyToClipboard(shareUrl);
      if (success) {
        setUrlCopied(true);
        setTimeout(
          () => setUrlCopied(false),
          UI_CONSTANTS.COPY_FEEDBACK_DURATION
        );
      }
    } catch {
      // Silently handle errors
    }
  }, [crawlData]);

  return (
    <main className="relative flex min-h-screen flex-col bg-crawl-black">
      {/* Starfield background - show on main page and during logo/crawl phases, hide during opening text */}
      {(!isPlaying || crawlPhase !== "opening-text") && <Starfield />}

      {/* Main content */}
      <div className="relative z-20 flex h-screen flex-col items-center justify-center p-4 sm:h-auto sm:flex-1 sm:p-6">
        {!crawlData || !isPlaying ? (
          <div className="w-full max-w-2xl space-y-4">
            <div className="text-center">
              <motion.h1
                className="mb-3 font-logo text-3xl font-bold uppercase tracking-wider text-crawl-yellow sm:text-4xl md:text-5xl"
                style={{ letterSpacing: "0.15em" }}
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  textShadow: [
                    "0 0 10px rgba(229, 177, 58, 0.3)",
                    "0 0 20px rgba(229, 177, 58, 0.5)",
                    "0 0 10px rgba(229, 177, 58, 0.3)",
                  ],
                }}
                transition={{
                  opacity: { duration: 0.8, ease: "easeOut" },
                  y: { duration: 0.8, ease: "easeOut" },
                  scale: { duration: 0.8, ease: "easeOut" },
                  textShadow: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
              >
                STAR CRAWLER
              </motion.h1>
              <motion.p
                className="font-opening-text text-sm text-gray-300 sm:text-base"
                style={{ letterSpacing: "0.05em" }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  opacity: { duration: 0.6, delay: 0.3, ease: "easeOut" },
                  y: { duration: 0.6, delay: 0.3, ease: "easeOut" },
                }}
              >
                Create and share your own opening crawl
              </motion.p>
            </div>

            <CrawlInput
              onSubmit={handleSubmit}
              initialData={crawlData || undefined}
            />

            {crawlData && !isPlaying && (
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={handleShareUrl}
                  className="inline-flex items-center gap-2 border-2 border-crawl-yellow/40 bg-black/80 px-4 min-[375px]:px-5 py-2.5 font-crawl text-sm font-bold uppercase tracking-wider text-crawl-yellow backdrop-blur-sm transition-colors hover:border-crawl-yellow hover:bg-crawl-yellow/10 active:bg-crawl-yellow/20 active:scale-95 touch-manipulation cursor-pointer min-h-[44px]"
                  style={{
                    letterSpacing: "0.1em",
                    clipPath:
                      "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                    touchAction: "manipulation",
                  }}
                  aria-label={urlCopied ? "URL copied!" : "Share URL"}
                >
                  {urlCopied ? (
                    <>
                      <Check className="size-4 shrink-0" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="size-4 shrink-0" />
                      <span>Share</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 border-2 border-crawl-yellow/40 bg-black/80 px-4 min-[375px]:px-5 py-2.5 font-crawl text-sm font-bold uppercase tracking-wider text-crawl-yellow backdrop-blur-sm transition-colors hover:border-crawl-yellow hover:bg-crawl-yellow/10 active:bg-crawl-yellow/20 active:scale-95 touch-manipulation cursor-pointer min-h-[44px]"
                  style={{
                    letterSpacing: "0.1em",
                    clipPath:
                      "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                    touchAction: "manipulation",
                  }}
                >
                  <RotateCcw className="size-4 shrink-0" />
                  <span>Reset</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <ErrorBoundary>
            <CrawlDisplay
              crawlData={crawlData}
              isPlaying={isPlaying}
              isPaused={isPaused}
              onComplete={handleComplete}
              onProgressChange={handleProgressChange}
              seekTo={seekTo}
              onPause={handlePause}
              onResume={handleResume}
              onClose={handleComplete}
              controlsVisible={controlsVisible}
              onControlsVisibilityChange={setControlsVisible}
              onPhaseChange={setCrawlPhase}
            />
          </ErrorBoundary>
        )}

        {/* Controls overlay when crawl is playing */}
        {isPlaying && crawlData && (
          <CrawlControls
            isPaused={isPaused}
            crawlData={crawlData}
            progress={progress}
            elapsed={elapsed}
            remaining={remaining}
            isFullscreen={isFullscreen}
            onPause={handlePause}
            onResume={handleResume}
            onSeek={handleSeek}
            onToggleFullscreen={handleToggleFullscreen}
            controlsVisible={controlsVisible}
            onControlsVisibilityChange={setControlsVisible}
          />
        )}
      </div>

      {/* Footer - only show when not playing */}
      {!isPlaying && <Footer />}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-screen bg-crawl-black">
          <Starfield />
          <div className="relative z-20 flex min-h-screen flex-col items-center justify-center">
            <div className="text-center">
              <h1 className="mb-2 font-logo text-3xl font-bold text-crawl-yellow sm:text-4xl md:text-5xl">
                STAR CRAWLER
              </h1>
              <p className="text-sm text-gray-200 sm:text-base">Loading...</p>
            </div>
          </div>
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
