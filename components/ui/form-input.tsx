import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  labelColor?: "cyan" | "yellow";
  error?: boolean;
  errorMessage?: string;
}

const FormInput = ({
  label,
  labelColor = "yellow",
  className,
  id,
  error,
  errorMessage,
  ref,
  ...props
}: FormInputProps & { ref?: React.Ref<HTMLInputElement> }) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;
    const labelColorClass =
      labelColor === "cyan"
        ? "text-crawl-cyan"
        : "text-crawl-yellow";
    const borderColorClass = error
      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/50"
      : labelColor === "cyan"
        ? "border-crawl-cyan/30 focus:border-crawl-cyan focus:ring-crawl-cyan/50"
        : "border-crawl-yellow/30 focus:border-crawl-yellow focus:ring-crawl-yellow/50";

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className={cn(
            "block font-crawl text-xs font-bold uppercase tracking-wider sm:text-sm",
            labelColorClass
          )}
          style={{ letterSpacing: "0.1em" }}
        >
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full border-2 bg-black px-4 py-2.5 font-opening-text text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black transition-colors",
            borderColorClass,
            className
          )}
          style={{
            clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
          }}
          aria-invalid={error}
          aria-describedby={error && errorMessage ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && errorMessage && (
          <p
            id={`${inputId}-error`}
            className="font-opening-text text-[10px] text-red-400 sm:text-xs"
            role="alert"
            aria-live="polite"
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
};
FormInput.displayName = "FormInput";

export { FormInput };

