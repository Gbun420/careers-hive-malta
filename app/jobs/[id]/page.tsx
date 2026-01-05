import Link from "next/link";
import type { Metadata } from "next";
import PublicJobDetail from "@/components/jobs/public-job-detail";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth/session";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Job } from "@/lib/jobs/schema";

export const runtime = "edge";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

const buildDescription = (text?: string | null) => {
  if (!text) {
    return "View verified job listings across Malta.";
  }
  const trimmed = text.trim();
  return trimmed.length > 160 ? `${trimmed.slice(0, 157)}...` : trimmed;
};

async function getJobForSeo(id: string): Promise<Job | null> {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("jobs")
    .select(
      "id, employer_id, title, description, location, salary_range, salary_min, salary_max, salary_period, currency, created_at, is_active"
    )
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return data as Job;
}

type JobDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: JobDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobForSeo(id);
  const title = job?.title
    ? `${job.title} | Careers Hive Malta`
    : "Job in Malta | Careers Hive Malta";
  const description = buildDescription(job?.description);

  return {
    title,
    description,
    ...(siteUrl
      ? {
          alternates: {
            canonical: `${siteUrl}/jobs/${id}`,
          },
        }
      : {}),
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
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

  const job = await getJobForSeo(id);
  const jobPostingJsonLd = job
    ? {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: job.title,
        description: job.description,
        datePosted: job.created_at,
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: job.location || "Malta",
            addressCountry: "MT",
          },
        },
        ...(job.salary_min && {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: job.currency || "EUR",
            value: {
              "@type": "QuantitativeValue",
              minValue: job.salary_min,
              maxValue: job.salary_max || job.salary_min,
              unitText: job.salary_period?.toUpperCase() || "YEAR",
            },
          },
        }),
      }
    : null;

  return (
    <>
      {jobPostingJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jobPostingJsonLd),
          }}
        />
      ) : null}
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
        <header>
          <Button variant="outline" asChild>
            <Link href="/jobs">Back to jobs</Link>
          </Button>
        </header>
        <PublicJobDetail id={id} />
      </main>
    </>
  );
}
