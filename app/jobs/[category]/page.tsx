import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import PublicJobsList from "@/components/jobs/public-jobs-list";
import { getCategoryName } from "@/lib/seo/slugs";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { attachFeaturedStatus } from "@/lib/billing/featured";
import { attachEmployerVerified } from "@/lib/trust/verification";
import { sortFeaturedJobs } from "@/lib/billing/featured";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bell, Briefcase } from "lucide-react";

type Props = {
  params: Promise<{ category: string }>;
};

async function getJobsByCategory(category: string) {
  const supabase = createServiceRoleClient();
  if (!supabase) return { data: [], count: 0 };

  const { data, count, error } = await supabase
    .from("jobs")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .eq("status", "active")
    .ilike("industry", `%${category}%`) // Assuming 'industry' column matches CATEGORY_MAP values
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch jobs by category error:", error);
    return { data: [], count: 0 };
  }

  const withFeatured = await attachFeaturedStatus(data || []);
  const enriched = await attachEmployerVerified(withFeatured);
  const sorted = sortFeaturedJobs(enriched);

  return { data: sorted, count: count || 0 };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const categoryName = getCategoryName(category);
  if (!categoryName) return {};

  const { count } = await getJobsByCategory(categoryName);
  const noindex = count < 3;

  return {
    title: `${categoryName} Jobs in Malta | Careers.mt`,
    description: `Discover the latest ${categoryName} job opportunities in Malta. Apply for verified roles from top companies.`,
    robots: {
      index: !noindex,
      follow: true,
    },
    alternates: {
      canonical: `/jobs/${category}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const categoryName = getCategoryName(category);
  if (!categoryName) notFound();

  const { data, count } = await getJobsByCategory(categoryName);

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="space-y-4">
          <SectionHeading 
            title={`${categoryName} Jobs in Malta`}
            subtitle={`Join the fastest growing companies in Malta. Discover high-performance roles in the ${categoryName.toLowerCase()} sector.`}
          />
          <div className="flex gap-3">
            <Button asChild className="rounded-xl bg-brand text-white border-none shadow-cta">
              <Link href="/signup" className="gap-2">
                <Bell className="h-4 w-4" />
                Get {categoryName} Alerts
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl border-slate-200">
              <Link href="/signup?role=employer" className="gap-2">
                <Briefcase className="h-4 w-4" />
                Post a {categoryName} Job
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
