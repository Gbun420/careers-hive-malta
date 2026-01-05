import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: 'verified' | 'featured' | 'new' | 'default' | 'success' | 'warning' | 'error';
  className?: string;
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: "bg-neutral-100 text-neutral-800 border-neutral-300",
    verified: "bg-brand-secondary text-white border-transparent",
    featured: "bg-brand-primary text-white border-transparent shadow-sm",
    new: "bg-brand-secondaryLight/10 text-brand-secondaryDark border-brand-secondaryLight/20",
    success: "bg-success-light/10 text-success-primary border-success-light/20",
    warning: "bg-brand-primaryLight/10 text-brand-primaryDark border-brand-primaryLight/20",
    error: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}