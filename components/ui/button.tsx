import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost" | "secondary" | "success";

type ButtonSize = "default" | "lg" | "sm";

const baseClasses =
  "btn inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 btn-ripple";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-gradient-primary text-white shadow-md hover:translate-y-[-2px] hover:shadow-lg",
  secondary:
    "bg-gradient-secondary text-white shadow-md hover:translate-y-[-2px] hover:shadow-lg",
  outline:
    "border-2 border-brand-primary bg-transparent text-brand-primaryDark hover:bg-brand-primary/10 hover:translate-y-[-2px]",
  ghost: "hover:bg-brand-primary/10 text-brand-primaryDark",
  success: "bg-gradient-success text-white shadow-md hover:translate-y-[-2px] hover:shadow-lg",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-12 px-8 text-sm",
  lg: "h-16 px-10 text-base font-bold",
  sm: "h-9 px-4 text-xs",
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
      loading && "btn-loading",
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
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };