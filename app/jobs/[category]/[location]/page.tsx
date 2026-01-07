import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import PublicJobsList from "@/components/jobs/public-jobs-list";
import { getCategoryName, getLocationName } from "@/lib/seo/slugs";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { attachFeaturedStatus } from "@/lib/billing/featured";
import { attachEmployerVerified } from "@/lib/trust/verification";
import { sortFeaturedJobs } from "@/lib/billing/featured";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bell, Briefcase, MapPin } from "lucide-react";

type Props = {
  params: Promise<{ category: string; location: string }>;
};

async function getJobsByCategoryAndLocation(category: string, location: string) {
  const supabase = createServiceRoleClient();
  if (!supabase) return { data: [], count: 0 };

  let query = supabase
    .from("jobs")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .eq("status", "active")
    .ilike("industry", `%${category}%`);

  if (location.toLowerCase() !== "malta") {
    query = query.ilike("location", `%${location}%`);
  }

  const { data, count, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch jobs error:", error);
    return { data: [], count: 0 };
  }

  const withFeatured = await attachFeaturedStatus(data || []);
  const enriched = await attachEmployerVerified(withFeatured);
  const sorted = sortFeaturedJobs(enriched);

  return { data: sorted, count: count || 0 };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, location } = await params;
  const categoryName = getCategoryName(category);
  const locationName = getLocationName(location);
  if (!categoryName || !locationName) return {};

  const { count } = await getJobsByCategoryAndLocation(categoryName, locationName);
  const noindex = count < 3;

  return {
    title: `${categoryName} Jobs in ${locationName} | Careers.mt`,
    description: `Browse the best ${categoryName} job opportunities in ${locationName}, Malta. Verified roles updated daily.`,
    robots: {
      index: !noindex,
      follow: true,
    },
    alternates: {
      canonical: `/jobs/${category}/${location}`,
    },
  };
}

export default async function CategoryLocationPage({ params }: Props) {
  const { category, location } = await params;
  const categoryName = getCategoryName(category);
  const locationName = getLocationName(location);
  if (!categoryName || !locationName) notFound();

  const { data, count } = await getJobsByCategoryAndLocation(categoryName, locationName);

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="space-y-4 text-center sm:text-left">
          <SectionHeading 
            title={`${categoryName} Jobs in ${locationName}`}
            subtitle={`Find your next career move in ${locationName}. Explore verified ${categoryName.toLowerCase()} roles delivered with zero latency.`}
          />
          <div className="flex flex-wrap justify-center sm:justify-start gap-3">
            <Button asChild className="rounded-xl bg-brand text-white border-none shadow-cta">
              <Link href="/signup" className="gap-2">
                <Bell className="h-4 w-4" />
                Alerts for {locationName}
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl border-slate-200">
              <Link href="/signup?role=employer" className="gap-2">
                <Briefcase className="h-4 w-4" />
                Post in {locationName}
              </Link>
            </Button>
          </div>
        </header>

        <PublicJobsList 
          initialData={data} 
          initialMeta={{ 
            total: count, 
            page: 1, 
            limit: 20, 
            has_more: count > 20 
          }} 
        />
      </div>
    </PageShell>
  );
}
