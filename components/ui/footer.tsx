"use client";

import Link from "next/link";
import { GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        "relative z-10 w-full border-t border-crawl-yellow/10 bg-black/40 backdrop-blur-sm",
        className
      )}
    >
      <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6">
        <nav
          className="flex flex-col items-center gap-2 text-center sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-4"
          aria-label="Legal links"
        >
          <Link
            href="/privacy"
            className="min-h-[44px] flex items-center justify-center px-2 py-1.5 cursor-pointer text-xs text-gray-300 transition-colors hover:text-crawl-yellow/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crawl-yellow/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:text-sm sm:min-h-0 sm:px-0 sm:py-0"
            style={{
              letterSpacing: "0.05em",
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
            }}
          >
            Privacy Policy
          </Link>
          <span className="hidden text-gray-500 sm:inline" aria-hidden="true">
            •
          </span>
          <Link
            href="/terms"
            className="min-h-[44px] flex items-center justify-center px-2 py-1.5 cursor-pointer text-xs text-gray-300 transition-colors hover:text-crawl-yellow/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crawl-yellow/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:text-sm sm:min-h-0 sm:px-0 sm:py-0"
            style={{
              letterSpacing: "0.05em",
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
            }}
          >
            Terms of Service
          </Link>
          <span className="hidden text-gray-500 sm:inline" aria-hidden="true">
            •
          </span>
          <Link
            href="/disclaimer"
            className="min-h-[44px] flex items-center justify-center px-2 py-1.5 cursor-pointer text-xs text-gray-300 transition-colors hover:text-crawl-yellow/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crawl-yellow/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:text-sm sm:min-h-0 sm:px-0 sm:py-0"
            style={{
              letterSpacing: "0.05em",
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
            }}
          >
            Disclaimer
          </Link>
          <span className="hidden text-gray-500 sm:inline" aria-hidden="true">
            •
          </span>
          <a
            href="https://github.com/mochixlb/starcrawler"
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-2 py-1.5 cursor-pointer text-xs text-gray-300 transition-colors hover:text-crawl-yellow/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crawl-yellow/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:basis-auto sm:text-sm sm:min-h-0 sm:px-0 sm:py-0"
            style={{
              letterSpacing: "0.05em",
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
            }}
            aria-label="View Star Crawler on GitHub"
          >
            <GitBranch className="size-3.5 sm:size-3.5" aria-hidden="true" />
            <span>GitHub</span>
          </a>
        </nav>
        <p
          className="mt-3 text-center text-[10px] text-gray-400 sm:mt-4 sm:text-xs"
          style={{
            letterSpacing: "0.05em",
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
          }}
        >
          © {new Date().getFullYear()} Star Crawler. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
