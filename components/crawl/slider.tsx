"use client";

import { useRef, useEffect, useState, useCallback } from "react";

export interface SliderProps {
  value: number; // 0-1
  onChange: (value: number) => void;
  onCommit?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  trackClassName?: string;
  rangeClassName?: string;
  thumbClassName?: string;
  ariaLabel?: string;
}

/**
 * Slider implementation with intuitive drag behavior
 * - Click/tap on track: immediate seek
 * - Drag thumb: smooth dragging with live updates, seek on release
 * - Works seamlessly on mouse and touch
 */
export function Slider({
  value,
  onChange,
  onCommit,
  min = 0,
  max = 1,
  step = 0.001,
  disabled = false,
  className = "",
  trackClassName = "",
  rangeClassName = "",
  thumbClassName = "",
  ariaLabel = "Slider",
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState<number | null>(null);
  const [prevValue, setPrevValue] = useState(value);
  const localValueRef = useRef<number | null>(null);

  if (!isDragging && value !== prevValue) {
    setPrevValue(value);
    if (localValue !== null) {
      localValueRef.current = null;
      setLocalValue(null);
    }
  }

  // Use local value during drag for immediate visual feedback, otherwise use prop value
  const displayValue = localValue !== null ? localValue : value;
  const clampedValue = Math.max(min, Math.min(max, displayValue));
  const percentage = ((clampedValue - min) / (max - min)) * 100;

  // Calculate value from client X position
  const getValueFromX = useCallback(
    (clientX: number): number => {
      if (!trackRef.current) {
        // Fallback to current display value if track ref not available
        return localValueRef.current !== null ? localValueRef.current : value;
      }

      const rect = trackRef.current.getBoundingClientRect();
      // Guard against zero or negative width (layout edge case)
      if (!rect.width || rect.width <= 0) {
        return localValueRef.current !== null ? localValueRef.current : value;
      }
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const rawValue = min + (percentage / 100) * (max - min);
      
      // Apply step
      if (step > 0) {
        return Math.round(rawValue / step) * step;
      }
      return rawValue;
    },
    [min, max, step, value]
  );

  // Handle thumb drag start
  const handleThumbPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;

      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      // Initialize local value for visual feedback during drag
      localValueRef.current = value;
      setLocalValue(value);
    },
    [disabled, value]
  );

  // Keyboard support for the focusable thumb (required for role="slider")
  const handleThumbKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      const range = max - min;
      const smallStep = Math.max(step, range / 100);
      const largeStep = range / 10;

      let newValue: number;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          newValue = clampedValue + smallStep;
          break;
        case "ArrowLeft":
        case "ArrowDown":
          newValue = clampedValue - smallStep;
          break;
        case "PageUp":
          newValue = clampedValue + largeStep;
          break;
        case "PageDown":
          newValue = clampedValue - largeStep;
          break;
        case "Home":
          newValue = min;
          break;
        case "End":
          newValue = max;
          break;
        default:
          return;
      }

      e.preventDefault();
      // Keep global shortcuts (e.g. arrow-key seeking) from also firing
      e.stopPropagation();

      newValue = Math.max(min, Math.min(max, newValue));
      onChange(newValue);
      onCommit?.(newValue);
    },
    [disabled, min, max, step, clampedValue, onChange, onCommit]
  );

  // Handle track pointer down (immediate seek)
  const handleTrackPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || isDragging) return;

      // Ignore presses on the thumb (thumb handles its own pointer events)
      if (thumbRef.current?.contains(e.target as Node)) {
        return;
      }

      const newValue = getValueFromX(e.clientX);
      onChange(newValue);
      onCommit?.(newValue);
    },
    [disabled, isDragging, getValueFromX, onChange, onCommit]
  );

  // Handle pointer move and up during drag
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!trackRef.current) return;

      e.preventDefault();
      const newValue = getValueFromX(e.clientX);
      
      // Update ref immediately for instant visual feedback
      localValueRef.current = newValue;
      // Update state synchronously for React to re-render
      setLocalValue(newValue);
      // Notify parent of change
      onChange(newValue);
    };

    const handlePointerUp = (e: PointerEvent) => {
      e.preventDefault();
      
      if (trackRef.current) {
        const finalValue = getValueFromX(e.clientX);
        // Update ref and state one last time
        localValueRef.current = finalValue;
        setLocalValue(finalValue);
        // Notify parent of change
        onChange(finalValue);
        if (onCommit) {
          onCommit(finalValue);
        }
      }

      setIsDragging(false);
      // Clear local value after a brief delay to sync with prop value
      setTimeout(() => {
        localValueRef.current = null;
        setLocalValue(null);
      }, 0);
    };

    // Use capture phase to ensure we catch events even if pointer leaves element
    document.addEventListener("pointermove", handlePointerMove, { capture: true });
    document.addEventListener("pointerup", handlePointerUp, { capture: true });
    document.addEventListener("pointercancel", handlePointerUp, { capture: true });

    return () => {
      document.removeEventListener("pointermove", handlePointerMove, { capture: true });
      document.removeEventListener("pointerup", handlePointerUp, { capture: true });
      document.removeEventListener("pointercancel", handlePointerUp, { capture: true });
    };
  }, [isDragging, getValueFromX, onChange, onCommit]);

  return (
    <div
      ref={trackRef}
      className={`relative flex h-5 w-full touch-none select-none items-center cursor-pointer ${trackClassName} ${className}`}
      onPointerDown={handleTrackPointerDown}
      style={{ touchAction: "none" }}
    >
      {/* Track */}
      <div
        className={`relative h-2 w-full grow cursor-pointer ${trackClassName}`}
        style={{
          clipPath: "polygon(0 0, calc(100% - 2px) 0, 100% 2px, 100% 100%, 2px 100%, 0 calc(100% - 2px))",
          backgroundColor: "rgba(255, 232, 31, 0.1)",
        }}
      >
        {/* Range (filled portion) */}
        <div
          className={`absolute h-full bg-crawl-yellow ${rangeClassName}`}
          style={{
            width: `${percentage}%`,
            clipPath: "polygon(0 0, calc(100% - 2px) 0, 100% 2px, 100% 100%, 2px 100%, 0 calc(100% - 2px))",
            // Disable transitions during drag for smooth movement
            transition: isDragging ? "none" : undefined,
          }}
        />
      </div>

      {/* Thumb */}
      <div
        ref={thumbRef}
        role="slider"
        aria-label={ariaLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clampedValue}
        aria-disabled={disabled}
        className={`absolute block h-5 w-5 border-2 border-crawl-yellow bg-crawl-yellow shadow-md cursor-grab touch-manipulation ${
          isDragging ? "cursor-grabbing scale-110" : "transition-all hover:scale-110"
        } focus:outline-none focus:ring-2 focus:ring-crawl-yellow focus:ring-offset-2 focus:ring-offset-black ${thumbClassName}`}
        style={{
          left: `calc(${percentage}% - 10px)`,
          clipPath: "polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px))",
          touchAction: "none",
          // Disable transitions during drag for smooth movement
          transition: isDragging ? "none" : undefined,
        }}
        onPointerDown={handleThumbPointerDown}
        onKeyDown={handleThumbKeyDown}
        tabIndex={disabled ? -1 : 0}
      />
    </div>
  );
}

