import Link from "next/link";
import JobCreate from "@/components/jobs/job-create";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth/session";

export default function EmployerJobsNewPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Jobs unavailable
        </h1>
        <p className="mt-3 text-slate-600">
          Connect Supabase to manage jobs and postings.
        </p>
        <Button asChild className="mt-6 w-fit">
          <Link href="/setup">Go to setup</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-16">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
          New job
        </p>
        <h1 className="font-display mt-3 text-3xl font-semibold text-slate-900">
          Create a job posting
        </h1>
        <p className="mt-2 text-slate-600">
          Reach qualified candidates with instant alerts.
        </p>
      </header>
      <JobCreate />
    </main>
  );
}
