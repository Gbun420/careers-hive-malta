import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { PageShell } from "@/components/ui/page-shell";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <PageShell>
      <EmptyState
        icon={FileQuestion}
        title="404 - Page not found"
        description="The page you are looking for might have been moved, deleted, or never existed in the Maltese islands."
        action={{
          label: "Return Home",
          href: "/"
        }}
      />
    </PageShell>
  );
}
