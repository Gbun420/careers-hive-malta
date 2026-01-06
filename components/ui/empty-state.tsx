import { LucideIcon } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: string; // We can't pass functions from Server Components
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 text-center animate-fade-in">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-400 mb-6">
        <Icon className="h-10 w-10" />
      </div>
      <h3 className="text-2xl font-black text-slate-950 mb-2">{title}</h3>
      <p className="text-slate-500 font-medium max-w-sm mb-8">{description}</p>
      {action && (
        <>
          {action.href ? (
            <Button asChild variant="outline" className="rounded-xl">
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
}
