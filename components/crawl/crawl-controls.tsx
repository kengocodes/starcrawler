"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Slider } from "./slider";
import {
  Play,
  Pause,
  Share2,
  Check,
  Maximize,
  Minimize,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyToClipboard, formatTime, buildCrawlText, encodeCrawlData, getBaseUrl, isUrlLengthSafe } from "@/lib/utils";
import { UI_CONSTANTS } from "@/lib/constants";
import type { CrawlData } from "@/lib/types";

// Controls auto-hide after this period of inactivity (YouTube-like behavior)
const AUTO_HIDE_DELAY = 3000; // milliseconds
// Shorter delay when the mouse leaves the controls area
const MOUSE_LEAVE_HIDE_DELAY = 1000; // milliseconds

export interface CrawlControlsProps {
  isPaused: boolean;
  crawlData: CrawlData;
  progress: number; // 0-1
  elapsed: number; // seconds
  remaining: number; // seconds
  isFullscreen: boolean;
  onPause: () => void;
  onResume: () => void;
  onSeek: (progress: number) => void;
  onToggleFullscreen: () => void;
  controlsVisible?: boolean;
  onControlsVisibilityChange?: (visible: boolean) => void;
}

// Reusable hook for copy feedback
function useCopyFeedback() {
  const [copied, setCopied] = useState(false);

  const showFeedback = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), UI_CONSTANTS.COPY_FEEDBACK_DURATION);
  };

  return { copied, showFeedback };
}

// Icon button component
interface IconButtonProps {
  onClick: () => void;
  ariaLabel: string;
  title: string;
  icon: React.ReactNode;
  className?: string;
}

function IconButton({
  onClick,
  ariaLabel,
  title,
  icon,
  className = "",
}: IconButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={`h-10 w-10 border-0 bg-transparent p-0 text-crawl-yellow hover:bg-crawl-yellow/10 focus-visible:ring-2 focus-visible:ring-crawl-yellow touch-manipulation cursor-pointer transition-colors ${className}`}
      aria-label={ariaLabel}
      title={title}
    >
      {icon}
    </Button>
  );
}

// Copy button component
interface CopyButtonProps {
  onClick: () => void;
  copied: boolean;
  label: string;
  icon: React.ReactNode;
  title: string;
}

function CopyButton({
  onClick,
  copied,
  label,
  icon,
  title,
  className = "",
}: CopyButtonProps & { className?: string }) {
  return (
    <Button
      onClick={onClick}
      className={`h-10 w-28 border-0 bg-transparent px-3 py-0 font-crawl text-xs font-bold uppercase tracking-wider text-crawl-yellow hover:bg-crawl-yellow/10 active:bg-crawl-yellow/20 focus-visible:ring-2 focus-visible:ring-crawl-yellow touch-manipulation overflow-hidden transition-colors ${className}`}
      style={{
        letterSpacing: "0.05em",
      }}
      aria-label={copied ? `${label} copied!` : `Copy ${label.toLowerCase()}`}
      title={title}
    >
      <span className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
        {copied ? (
          <>
            <Check className="size-3.5 shrink-0" />
            <span className="truncate">Copied!</span>
          </>
        ) : (
          <>
            <span className="shrink-0">{icon}</span>
            <span className="truncate">{label}</span>
          </>
        )}
      </span>
    </Button>
  );
}

export function CrawlControls({
  isPaused,
  crawlData,
  progress,
  elapsed,
  remaining,
  isFullscreen,
  onPause,
  onResume,
  onSeek,
  onToggleFullscreen,
  controlsVisible: externalVisible,
  onControlsVisibilityChange,
}: CrawlControlsProps) {
  const { copied: copiedText, showFeedback: showTextFeedback } =
    useCopyFeedback();
  const { copied: copiedUrl, showFeedback: showUrlFeedback } =
    useCopyFeedback();
  const [internalVisible, setInternalVisible] = useState(false);
  const [showCenterButton, setShowCenterButton] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wasPausedBeforeDragRef = useRef<boolean | null>(null);
  const isDraggingRef = useRef(false);
  const onChangeCallCountRef = useRef(0);

  // Use external visibility if provided, otherwise use internal state
  const isVisible =
    externalVisible !== undefined ? externalVisible : internalVisible;
  const setIsVisible = onControlsVisibilityChange || setInternalVisible;

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  // Schedule the controls to hide after a delay
  const scheduleHide = useCallback(
    (delay: number = AUTO_HIDE_DELAY) => {
      clearHideTimeout();
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        setShowCenterButton(false);
      }, delay);
    },
    [clearHideTimeout, setIsVisible]
  );

  // Show the controls; auto-hide after a delay unless autoHide is false
  // (e.g. while the user is dragging the slider)
  const showControls = useCallback(
    ({ autoHide = true }: { autoHide?: boolean } = {}) => {
      setIsVisible(true);
      setShowCenterButton(true);
      clearHideTimeout();
      if (autoHide) {
        scheduleHide();
      }
    },
    [clearHideTimeout, scheduleHide, setIsVisible]
  );

  // Desktop: show controls on mouse move with auto-hide
  useEffect(() => {
    const handleMouseMove = () => {
      showControls();
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearHideTimeout();
    };
  }, [showControls, clearHideTimeout]);

  // When visibility is toggled externally (e.g., by CrawlDisplay), manage auto-hide timer
  // This ensures controls auto-hide after 3 seconds of inactivity (YouTube-like behavior)
  useEffect(() => {
    if (isVisible) {
      setShowCenterButton(true);
      scheduleHide();
    } else {
      // Controls are hidden - clear any pending timeout
      clearHideTimeout();
    }
    return clearHideTimeout;
  }, [isVisible, scheduleHide, clearHideTimeout]);

  const handleShareUrl = async () => {
    try {
      const encoded = encodeCrawlData(crawlData);
      const baseUrl = getBaseUrl();
      
      if (!isUrlLengthSafe(baseUrl, encoded)) {
        return;
      }
      
      const shareUrl = `${baseUrl}?crawl=${encoded}`;
      const success = await copyToClipboard(shareUrl);
      if (success) {
        showUrlFeedback();
      }
    } catch {
      // Silently handle errors
    }
  };

  const handleCopyText = async () => {
    const fullText = buildCrawlText(crawlData);
    const success = await copyToClipboard(fullText);
    if (success) {
      showTextFeedback();
    }
  };

  // Handle slider value changes (during drag)
  const handleSliderChange = (newProgress: number) => {
    // Show controls when user interacts with slider.
    // Don't auto-hide during drag - wait for commit.
    showControls({ autoHide: false });

    // Increment call count to detect if this is a drag (multiple calls) vs click (single call)
    onChangeCallCountRef.current += 1;

    // Pause animation during drag (thumb drag) if this is the second+ onChange call
    // Track clicks only call onChange once, then immediately onCommit, so we skip pause
    if (!isDraggingRef.current && onChangeCallCountRef.current > 1) {
      // This is a drag (multiple onChange calls), not a track click
      isDraggingRef.current = true;
      wasPausedBeforeDragRef.current = isPaused;
      if (!isPaused) {
        onPause();
      }
    }

    // Seek in real-time during drag for live preview
    onSeek(newProgress);
  };

  // Handle slider commit (when drag ends or track is clicked)
  const handleSliderCommit = (finalProgress: number) => {
    // Seek to the final position (if not already at this position from onChange)
    onSeek(finalProgress);

    // Resume animation if it was playing before drag started
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      if (wasPausedBeforeDragRef.current === false && isPaused) {
        onResume();
      }
      wasPausedBeforeDragRef.current = null;
    }

    // Reset call count for next interaction
    onChangeCallCountRef.current = 0;

    scheduleHide();
  };

  const totalTime = elapsed + remaining;
  const timeDisplay = (
    <div
      className="flex items-center gap-1 font-opening-text text-xs font-medium text-crawl-yellow whitespace-nowrap"
      style={{ letterSpacing: "0.05em" }}
    >
      <span className="truncate">{formatTime(elapsed)}</span>
      <span className="text-crawl-yellow/75 shrink-0">/</span>
      <span className="truncate">{formatTime(totalTime)}</span>
    </div>
  );

  return (
    <>
      {/* Centered Play Button - Only rendered when controls are visible and center button should show */}
      {isVisible && showCenterButton && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none transition-opacity duration-300 opacity-100"
          data-controls-area
        >
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering crawl-display's handleInteraction
              if (isPaused) {
                onResume();
              } else {
                onPause();
              }
              // Keep controls visible when clicking the center button
              showControls();
            }}
            onTouchStart={(e) => {
              e.stopPropagation(); // Prevent triggering crawl-display's handleInteraction
              // Keep controls visible when touching the center button
              showControls();
            }}
            className="pointer-events-auto flex h-24 w-24 items-center justify-center bg-transparent p-0 text-crawl-yellow transition-all hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crawl-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black touch-manipulation cursor-pointer"
            style={{ touchAction: "manipulation" }}
            aria-label={isPaused ? "Resume crawl" : "Pause crawl"}
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? (
              <Play className="size-16 fill-current" />
            ) : (
              <Pause className="size-16 fill-current" />
            )}
          </button>
        </div>
      )}

      {/* Bottom Controls */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        data-controls-area
        onMouseEnter={() => {
          showControls();
        }}
        onMouseLeave={() => {
          scheduleHide(MOUSE_LEAVE_HIDE_DELAY);
        }}
        onTouchStart={() => {
          // Always show controls when touching the bottom controls area
          showControls();
        }}
        style={{
          pointerEvents: isVisible ? "auto" : "none",
        }}
      >
        <div className="w-full bg-gradient-to-t from-black/90 via-black/80 to-transparent pb-4 pt-8">
          {/* Progress Bar */}
          <div
            className="mb-3 px-4"
            style={{ minHeight: "44px", display: "flex", alignItems: "center" }}
          >
            <Slider
              value={progress}
              onChange={handleSliderChange}
              onCommit={handleSliderCommit}
              min={0}
              max={1}
              step={0.001}
              ariaLabel="Crawl progress"
              trackClassName=""
              rangeClassName="bg-crawl-yellow"
              thumbClassName="border-crawl-yellow bg-crawl-yellow"
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between px-4">
            {/* Left: Play button and Timer (Desktop) / Timer only (Mobile) */}
            <div className="flex items-center gap-3">
              {/* Desktop: Show play button */}
              <div className="hidden sm:flex">
                <IconButton
                  onClick={isPaused ? onResume : onPause}
                  ariaLabel={isPaused ? "Resume crawl" : "Pause crawl"}
                  title={isPaused ? "Resume (Space)" : "Pause (Space)"}
                  icon={
                    isPaused ? (
                      <Play className="size-5 fill-current" />
                    ) : (
                      <Pause className="size-5 fill-current" />
                    )
                  }
                />
              </div>
              {timeDisplay}
            </div>

            {/* Right: Copy text, Share, Fullscreen */}
            <div className="flex items-center gap-2">
              <CopyButton
                onClick={handleCopyText}
                copied={copiedText}
                label="Copy Text"
                icon={<Copy className="size-3.5 shrink-0" />}
                title="Copy text"
              />
              <CopyButton
                onClick={handleShareUrl}
                copied={copiedUrl}
                label="Share"
                icon={<Share2 className="size-3.5 shrink-0" />}
                title="Share URL"
              />
              {/* Hide fullscreen button on mobile since it's already full screen */}
              <div className="hidden sm:flex">
                <IconButton
                  onClick={onToggleFullscreen}
                  ariaLabel={
                    isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                  }
                  title={
                    isFullscreen
                      ? "Exit fullscreen (F)"
                      : "Enter fullscreen (F)"
                  }
                  icon={
                    isFullscreen ? (
                      <Minimize className="size-5" />
                    ) : (
                      <Maximize className="size-5" />
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
