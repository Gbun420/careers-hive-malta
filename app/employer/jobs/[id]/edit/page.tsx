import Link from "next/link";
import JobEdit from "@/components/jobs/job-edit";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth/session";
import {
  getFeaturedDurationDays,
  getFeaturedPriceLabel,
  isStripeConfigured,
} from "@/lib/billing/stripe";

export const runtime = "nodejs";

type EditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EmployerJobEditPage({ params }: EditPageProps) {
  const { id } = await params;
  const billingEnabled = isStripeConfigured();
  const featuredDurationDays = getFeaturedDurationDays();
  const featuredPriceLabel = getFeaturedPriceLabel();

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
          Edit job
        </p>
        <h1 className="font-display mt-3 text-3xl font-semibold text-slate-900">
          Update job posting
        </h1>
        <p className="mt-2 text-slate-600">
          Keep your listing accurate and up to date.
        </p>
      </header>
      <JobEdit
        id={id}
        billingEnabled={billingEnabled}
        featuredDurationDays={featuredDurationDays}
        featuredPriceLabel={featuredPriceLabel}
      />
    </main>
  );
}
