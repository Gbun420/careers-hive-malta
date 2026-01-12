import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: 'verified' | 'featured' | 'new' | 'default' | 'success' | 'warning' | 'error';
  className?: string;
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: "bg-muted text-muted-foreground border-border",
    verified: "bg-brand/10 text-brand border-brand/20",
    featured: "bg-brand-accent/10 text-brand-accent border-brand-accent/20 shadow-sm",
    new: "bg-brand/10 text-brand border-brand/20",
    success: "bg-secondary/10 text-secondary border-emerald-500/20",
    warning: "bg-brand-accent/10 text-brand-accent border-brand-accent/20",
    error: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-tight uppercase",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
