import { Metadata } from 'next';
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: 'Malta Work Permit Guide 2026: International Applicants | Careers.mt',
  description: 'A comprehensive guide to the Single Permit process and working in Malta as a third-country national.',
};

export default function BlogPost() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16 text-slate-800 leading-relaxed text-lg">
      <header>
        <Button variant="outline" asChild className="-ml-4 mb-4">
            <Link href="/blog">← Back to blog</Link>
        </Button>
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Relocation</p>
        <h1 className="mt-2 font-sans text-5xl font-extrabold text-slate-950 leading-tight tracking-tightest">
          Malta Work Permit Guide 2026
        </h1>
      </header>

      <div className="prose prose-slate lg:prose-xl max-w-none">
        <p className="lead text-xl text-slate-600">
          Moving to Malta for work is an exciting step. For non-EU citizens, understanding the Single Permit process is crucial for a smooth transition.
        </p>
        
        <h2 className="mt-12 text-3xl font-bold text-slate-950 tracking-tight">The Single Permit Process</h2>
        <p>
          In 2026, the process is primarily handled by <strong>Identità</strong>. The Single Permit authorizes third-country nationals to reside and work in Malta for a specific period with a specific employer.
        </p>

        <h2 className="mt-12 text-3xl font-bold text-slate-950 tracking-tight">Key Requirements</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li>A valid job offer from a Maltese employer.</li>
          <li>Comprehensive health insurance.</li>
          <li>Lease agreement for your accommodation in Malta.</li>
        </ul>

        <p className="mt-8">
          Always check with your prospective employer if they provide relocation assistance or handle the permit filing on your behalf.
        </p>
      </div>
    </main>
  );
}
