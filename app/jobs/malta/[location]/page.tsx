import { Metadata } from 'next';
import PublicJobsList from "@/components/jobs/public-jobs-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16">
      <header>
        <Button variant="outline" asChild className="-ml-4 mb-4">
            <Link href="/jobs">← All jobs</Link>
        </Button>
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Jobs in {locationName}, Malta
        </h1>
        <p className="mt-2 text-slate-600">
          Discover the latest career opportunities in {locationName} from verified employers.
        </p>
      </header>
      {/* Passing location as a query could be implemented in PublicJobsList if supported, 
          otherwise it just shows the list with search. 
          Current PublicJobsList has internal state for location.
      */}
      <PublicJobsList />
    </main>
  );
}
