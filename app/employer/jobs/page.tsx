import { Suspense } from "react";
import Link from "next/link";
import EmployerJobList from "@/components/jobs/employer-job-list";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth/session";
import {
  getFeaturedDurationDays,
  getFeaturedPriceLabel,
  isStripeConfigured,
} from "@/lib/billing/stripe";

export default function EmployerJobsPage() {
  const billingEnabled = isStripeConfigured();
  const featuredDurationDays = getFeaturedDurationDays();
  const featuredPriceLabel = getFeaturedPriceLabel();

  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
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
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-slate-900">
            Your job posts
          </h1>
          <p className="mt-2 text-slate-600">
            Manage listings and keep alerts firing fast.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/employer/jobs/new">Create job</Link>
        </Button>
      </header>
      <Suspense
        fallback={
          <p className="text-sm text-slate-600">Loading jobs...</p>
        }
      >
        <EmployerJobList
          billingEnabled={billingEnabled}
          featuredDurationDays={featuredDurationDays}
          featuredPriceLabel={featuredPriceLabel}
        />
      </Suspense>
    </main>
  );
}
