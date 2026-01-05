import { AlertCircle } from "lucide-react";
import { Button } from "./button";

interface ErrorStateProps {
  message?: string;
  onRetryHref?: string;
}

export function ErrorState({
  message = "Something went wrong. Please try again.",
  onRetryHref,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-rose-100 bg-rose-50/50 p-8 text-center animate-fade-in">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-100 text-rose-600 mb-6">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h3 className="text-2xl font-black text-slate-950 mb-2">Error</h3>
      <p className="text-slate-500 font-medium max-w-sm mb-8">{message}</p>
      {onRetryHref && (
        <Button asChild variant="default" className="rounded-xl bg-slate-950 text-white">
          <a href={onRetryHref}>Retry</a>
        </Button>
      )}
    </div>
  );
}