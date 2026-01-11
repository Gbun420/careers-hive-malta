import Link from "next/link";
import type { Metadata } from "next";
import PublicJobDetail from "@/components/jobs/public-job-detail";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth/session";
import { createServiceRoleClient, createRouteHandlerClient } from "@/lib/supabase/server";
import type { Job } from "@/lib/jobs/schema";
import { PageShell } from "@/components/ui/page-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase, ChevronLeft } from "lucide-react";
import { secondMeEnabled } from "@/lib/flags";
import SecondMePanel from "@/components/second-me/SecondMePanel";
import { getUserRole } from "@/lib/auth/roles";
import { SITE_URL } from "@/lib/site/url";
import { BRAND_NAME } from "@/lib/brand";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    ? `${job.title} | ${BRAND_NAME}`
    : `Job in Malta | ${BRAND_NAME}`;
  const description = buildDescription(job?.description);

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/job/${id}`,
    },
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <PageShell>
        <EmptyState 
          icon={Briefcase}
          title="Job details unavailable"
          description={`Connect Supabase to view matching opportunities on ${BRAND_NAME}.`}
          action={{
            label: "Go to setup",
            href: "/setup"
          }}
        />
      </PageShell>
    );
  }

  const job = await getJobForSeo(id);
  const supabase = createRouteHandlerClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const role = getUserRole(user);
  const isJobseeker = role === "jobseeker";

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
    <PageShell>
      {jobPostingJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jobPostingJsonLd),
          }}
        />
      ) : null}
      
      <div className="flex flex-col gap-8 max-w-5xl mx-auto">
        <header>
          <Button variant="ghost" asChild className="-ml-4 text-muted-foreground hover:text-brand">
            <Link href="/jobs" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Opportunities
            </Link>
          </Button>
        </header>
        
        <div className="grid gap-10 lg:grid-cols-[1fr_350px] items-start">
          <PublicJobDetail id={id} />
          {isJobseeker && (
            <div className="lg:sticky lg:top-24">
              <SecondMePanel jobId={id} isEnabled={secondMeEnabled} />
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}