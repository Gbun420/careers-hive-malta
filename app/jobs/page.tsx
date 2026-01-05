import Link from "next/link";
import type { Metadata } from "next";
import PublicJobsList from "@/components/jobs/public-jobs-list";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth/session";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  title: "Latest jobs in Malta | Careers.mt",
  description:
    "Discover new jobs in Malta with instant alerts and verified employers.",
  ...(siteUrl
    ? {
        alternates: {
          canonical: `${siteUrl}/jobs`,
        },
      }
    : {}),
};

export default function JobsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Jobs feed unavailable
        </h1>
        <p className="mt-3 text-slate-600">
          Connect Supabase to load job listings.
        </p>
        <Button asChild className="mt-6 w-fit">
          <Link href="/setup">Go to setup</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16">
      <header>
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Latest jobs in Malta
        </h1>
        <p className="mt-2 text-slate-600">
          Discover roles filtered by alerts and verified employers.
        </p>
      </header>
      <PublicJobsList />
    </main>
  );
}
