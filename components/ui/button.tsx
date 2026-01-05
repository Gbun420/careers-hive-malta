import * as React from "react";

type ButtonVariant = "default" | "outline";

type ButtonSize = "default" | "lg";

const baseClasses =
  "inline-flex items-center justify-center rounded-full font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-brand-600 text-white shadow-sm hover:bg-brand-700 ring-offset-slate-50 active:scale-[0.98]",
  outline:
    "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-300 ring-offset-slate-50 active:scale-[0.98]",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

function cx(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      type = "button",
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const classes = cx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    if (asChild && React.isValidElement(children)) {
      const childProps = {
        ...props,
        className: cx(classes, children.props.className),
      } as React.HTMLAttributes<HTMLElement>;
      return React.cloneElement(children, childProps);
    }

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
