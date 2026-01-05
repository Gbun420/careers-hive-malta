import * as React from "react";

function cx(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cx(
          "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
