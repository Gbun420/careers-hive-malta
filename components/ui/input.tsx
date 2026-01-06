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
          "w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-sm text-charcoal shadow-sm transition-all placeholder:text-slate-400 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };