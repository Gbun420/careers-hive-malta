import { Metadata } from 'next';
import PublicJobsList from "@/components/jobs/public-jobs-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
    title: `${industryName} Jobs in Malta | Careers Hive Malta`,
    description: `Browse ${industryName} career opportunities in Malta from top employers. Apply for the latest roles in ${industryName.toLowerCase()} today.`,
  };
}

export default async function IndustryPage({ params }: Props) {
  const { industry } = await params;
  const industryName = industryMap[industry.toLowerCase()] || industry.charAt(0).toUpperCase() + industry.slice(1);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16">
      <header>
        <Button variant="outline" asChild className="-ml-4 mb-4">
            <Link href="/jobs">← All jobs</Link>
        </Button>
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          {industryName} Jobs in Malta
        </h1>
        <p className="mt-2 text-slate-600">
          Discover {industryName.toLowerCase()} career opportunities in Malta from top employers.
        </p>
      </header>
      <PublicJobsList />
    </main>
  );
}
