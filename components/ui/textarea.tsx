import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = ({
  className,
  ref,
  ...props
}: TextareaProps & { ref?: React.Ref<HTMLTextAreaElement> }) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full border-2 border-crawl-yellow/30 bg-black px-4 py-3 font-opening-text text-sm text-white ring-offset-black placeholder:text-gray-400 focus-visible:border-crawl-yellow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crawl-yellow focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      style={{
        clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
      }}
      ref={ref}
      {...props}
    />
  );
};
Textarea.displayName = "Textarea";

export { Textarea };

