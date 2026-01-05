import * as React from "react";

type ButtonVariant = "default" | "outline";

type ButtonSize = "default" | "lg";

const baseClasses =
  "inline-flex items-center justify-center rounded-lg font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-slate-950 text-white hover:bg-brand-600 shadow-subtle",
  outline:
    "border border-slate-200 bg-white text-slate-950 hover:border-slate-300 hover:bg-slate-50",
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
