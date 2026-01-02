import Link from "next/link";
import PublicJobDetail from "@/components/jobs/public-job-detail";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth/session";

type JobDetailPageProps = {
  params: { id: string };
};

export default function JobDetailPage({ params }: JobDetailPageProps) {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Job details unavailable
        </h1>
        <p className="mt-3 text-slate-600">
          Connect Supabase to view job details.
        </p>
        <Button asChild className="mt-6 w-fit">
          <Link href="/setup">Go to setup</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <header>
        <Button variant="outline" asChild>
          <Link href="/jobs">Back to jobs</Link>
        </Button>
      </header>
      <PublicJobDetail id={params.id} />
    </main>
  );
}
