import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = 
  | "default"
  | "primary" 
  | "secondary" 
  | "tertiary" 
  | "premium"
  | "outline" 
  | "ghost" 
  | "destructive";

type ButtonSize = "default" | "lg" | "sm" | "xl" | "icon";

const baseClasses =
  "inline-flex items-center justify-center rounded-2xl font-black uppercase tracking-widest transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald-500 focus-visible:ring-offset-2 ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.96] hover:-translate-y-0.5";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-brand-emerald-600 text-white shadow-cta hover:bg-brand-emerald-500 hover:shadow-cta-hover",
  primary:
    "bg-brand-emerald-600 text-white shadow-cta hover:bg-brand-emerald-500 hover:shadow-cta-hover",
  secondary:
    "bg-brand-slate-900 text-white hover:bg-brand-slate-800 shadow-xl",
  tertiary:
    "bg-white text-brand-slate-900 border-2 border-brand-slate-100 hover:border-brand-emerald-500/30 hover:bg-brand-emerald-50/50",
  premium:
    "bg-brand-emerald-600 text-white shadow-cta hover:bg-brand-emerald-500 hover:shadow-cta-hover",
  outline:
    "border-2 border-brand-slate-200 bg-transparent text-brand-slate-600 hover:border-brand-emerald-500/40 hover:text-brand-emerald-600",
  ghost: 
    "text-brand-slate-500 hover:bg-brand-slate-100 hover:text-brand-slate-900",
  destructive:
    "bg-red-600 text-white hover:bg-red-500 shadow-sm",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-12 px-6 text-xs",
  lg: "h-14 px-8 text-sm",
  xl: "h-16 px-10 text-base",
  sm: "h-10 px-4 text-[10px]",
  icon: "h-12 w-12",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      type = "button",
      asChild = false,
      loading = false,
      children,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    if (asChild && React.isValidElement(children)) {
      const childProps = {
        ...props,
        className: cn(classes, (children.props as any).className),
      } as React.HTMLAttributes<HTMLElement>;
      return React.cloneElement(children, childProps);
    }

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };