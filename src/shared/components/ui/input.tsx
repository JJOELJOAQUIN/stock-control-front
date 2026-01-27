// src/shared/components/ui/input.tsx

import * as React from "react";
import { cn } from "@/shared/lib/utils";

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> & {
  value?: any;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, value, ...props }, ref) => {
    const normalizeValue = (
      v: any
    ): string | number | readonly string[] | undefined => {
      if (v === null || v === undefined) return "";
      if (type === "date") {
        if (typeof v === "string") return v;
        if (v instanceof Date) return v.toISOString().slice(0, 10);
        return String(v);
      }
      if (typeof v === "string" || typeof v === "number") return v;
      return String(v);
    };

    const normalizedValue =
      value !== undefined ? normalizeValue(value) : undefined;

    return (
      
      <input
        ref={ref}
        type={type}
        value={normalizedValue}
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          " focus:border-image-[linear-gradient(90deg,#da291c_3.17%,#b52217_100%)_1]", // ← SOLO BORDER GRADIENT
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
