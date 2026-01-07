import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm transition-all placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
