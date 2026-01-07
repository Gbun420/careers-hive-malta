"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { PageShell } from "@/components/ui/page-shell";
import { ErrorState } from "@/components/ui/error-state";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageShell>
      <ErrorState
        message="A system error occurred while loading this page. Our technical team has been notified."
        onRetryHref="/"
      />
    </PageShell>
  );
}
