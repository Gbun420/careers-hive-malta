import Link from "next/link";
import JobPostingWizard from "@/components/employer/job-posting-wizard";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth/session";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase } from "lucide-react";

export default function EmployerJobsNewPage() {
  if (!isSupabaseConfigured()) {
    return (
      <PageShell>
        <EmptyState 
          icon={Briefcase}
          title="Jobs unavailable"
          description="Connect Supabase to manage jobs and postings."
          action={{
            label: "Go to setup",
            href: "/setup"
          }}
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <header className="mb-12">
        <SectionHeading 
          title="Create a job posting" 
          subtitle="Reach qualified candidates with instant alerts and premium matching."
        />
      </header>
      <JobPostingWizard />
    </PageShell>
  );
}