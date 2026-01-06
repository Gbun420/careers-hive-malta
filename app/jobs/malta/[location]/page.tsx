import { Metadata } from 'next';
import PublicJobsList from "@/components/jobs/public-jobs-list";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { getJobs } from "@/lib/jobs/get-jobs";

type Props = {
  params: Promise<{ location: string }>;
};

const locationMap: { [key: string]: string } = {
  'valletta': 'Valletta',
  'sliema': 'Sliema',
  'st-julians': 'St. Julians',
  'gzira': 'Gżira',
  'msida': 'Msida',
  'birkirkara': 'Birkirkara',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location } = await params;
  const locationName = locationMap[location.toLowerCase()] || location.charAt(0).toUpperCase() + location.slice(1);
  
  return {
    title: `Jobs in ${locationName}, Malta | Careers.mt`,
    description: `Find employment opportunities in ${locationName}, Malta. Browse IT, marketing, finance jobs from verified Maltese employers.`,
  };
}

export default async function MaltaLocationPage({ params }: Props) {
  const { location } = await params;
  const locationName = locationMap[location.toLowerCase()] || location.charAt(0).toUpperCase() + location.slice(1);

  // SSR initial fetch (Filtered by location)
  const initialData = await getJobs({ location: locationName, limit: 20 });

  return (
    <PageShell>
      <header className="mb-12">
        <Button variant="ghost" asChild className="-ml-4 mb-8 text-slate-500 hover:text-brand-primary">
          <Link href="/jobs" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            All Opportunities
          </Link>
        </Button>
        <SectionHeading 
          title={`Jobs in ${locationName}, Malta`}
          subtitle={`Discover the latest career opportunities in ${locationName} from verified Maltese employers.`}
        />
      </header>
      <PublicJobsList initialData={initialData.data} initialMeta={initialData.meta} />
    </PageShell>
  );
}