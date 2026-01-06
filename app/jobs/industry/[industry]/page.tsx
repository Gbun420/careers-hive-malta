import { Metadata } from 'next';
import PublicJobsList from "@/components/jobs/public-jobs-list";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { getJobs } from "@/lib/jobs/get-jobs";

type Props = {
  params: Promise<{ industry: string }>;
};

const industryMap: { [key: string]: string } = {
  'it': 'IT & Technology',
  'marketing': 'Marketing',
  'finance': 'Finance & Banking',
  'hospitality': 'Hospitality',
  'healthcare': 'Healthcare',
  'legal': 'Legal',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { industry } = await params;
  const industryName = industryMap[industry.toLowerCase()] || industry.charAt(0).toUpperCase() + industry.slice(1);
  
  return {
    title: `${industryName} Jobs in Malta | Careers.mt`,
    description: `Browse ${industryName} career opportunities in Malta from top employers. Apply for the latest roles in ${industryName.toLowerCase()} today.`,
  };
}

export default async function IndustryPage({ params }: Props) {
  const { industry } = await params;
  const industryName = industryMap[industry.toLowerCase()] || industry.charAt(0).toUpperCase() + industry.slice(1);

  // SSR initial fetch (Simplified for now, real implementation would filter by industry)
  const initialData = await getJobs({ limit: 20 });

  return (
    <PageShell>
      <header className="mb-12">
        <Button variant="ghost" asChild className="-ml-4 mb-8 text-slate-500 hover:text-brand">
          <Link href="/jobs" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            All Opportunities
          </Link>
        </Button>
        <SectionHeading 
          title={`${industryName} Jobs in Malta`}
          subtitle={`Discover the latest ${industryName.toLowerCase()} career opportunities from verified Maltese employers.`}
        />
      </header>
      <PublicJobsList initialData={initialData.data} initialMeta={initialData.meta} />
    </PageShell>
  );
}