"use client";

import {
  ErrorBoundary as ReactErrorBoundary,
  type FallbackProps,
} from "react-error-boundary";
import { RotateCcw } from "lucide-react";

type ErrorFallbackProps = FallbackProps;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }
  return "Unknown error";
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div
      className="rounded-md border-2 border-red-500/40 bg-red-500/10 px-4 py-3 backdrop-blur-sm"
      role="alert"
      style={{
        clipPath:
          "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
      }}
    >
      <div className="space-y-2">
        <p className="font-opening-text text-sm font-medium text-red-400">
          Something went wrong
        </p>
        {process.env.NODE_ENV === "development" && (
          <p className="font-opening-text text-xs text-red-300/70">
            {getErrorMessage(error)}
          </p>
        )}
        <button
          type="button"
          onClick={resetErrorBoundary}
          className="inline-flex items-center gap-1.5 border-2 border-red-500/40 bg-black/60 px-3 py-1.5 font-crawl text-xs font-bold uppercase tracking-wider text-red-400 backdrop-blur-sm transition-colors hover:border-red-500 hover:bg-red-500/10 active:scale-95 touch-manipulation cursor-pointer"
          style={{
            letterSpacing: "0.1em",
            clipPath:
              "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
            touchAction: "manipulation",
          }}
        >
          <RotateCcw className="size-3 shrink-0" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: unknown, errorInfo: React.ErrorInfo) => void;
}

export function ErrorBoundary({
  children,
  fallback,
  onError,
}: ErrorBoundaryProps) {
  const handleError = (error: unknown, errorInfo: React.ErrorInfo) => {
    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
    // Call custom error handler if provided
    onError?.(error, errorInfo);
    // In production, you could send to error monitoring service here
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={fallback || ErrorFallback}
      onError={handleError}
      onReset={() => {
        // Reset any error-related state if needed
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

