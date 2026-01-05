import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: 'verified' | 'featured' | 'new' | 'default';
  className?: string;
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    verified: "bg-navy-50 text-navy-700 border-navy-200",
    featured: "bg-gold-50 text-gold-700 border-gold-200",
    new: "bg-coral-50 text-coral-700 border-coral-200",
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-tight",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
