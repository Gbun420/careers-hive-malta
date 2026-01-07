import type { Metadata } from "next";
import PublicJobsList from "@/components/jobs/public-jobs-list";
import { isSupabaseConfigured } from "@/lib/auth/session";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase } from "lucide-react";
import { getJobs } from "@/lib/jobs/get-jobs";
import { SITE_URL } from "@/lib/site/url";

export const metadata: Metadata = {
  title: "Latest jobs in Malta | Careers.mt",
  description:
    "Discover new jobs in Malta with instant alerts and verified employers.",
  alternates: {
    canonical: `${SITE_URL}/jobs`,
  },
};

export default async function JobsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <PageShell>
        <EmptyState 
          icon={Briefcase}
          title="Jobs feed unavailable"
          description="Connect Supabase to load job listings and explore matching opportunities in Malta."
          action={{
            label: "Go to setup",
            href: "/setup"
          }}
        />
      </PageShell>
    );
  }

  // Initial fetch for SSR
  const initialData = await getJobs({ limit: 20 });

  return (
    <PageShell>
      <header className="mb-12">
        <SectionHeading 
          title="Latest Jobs in Malta" 
          subtitle="Discover high-performance roles filtered by real-time alerts and manual employer verification."
        />
      </header>
      <PublicJobsList initialData={initialData.data} initialMeta={initialData.meta} />
    </PageShell>
  );
}