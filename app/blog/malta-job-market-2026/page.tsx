import { Metadata } from 'next';
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: 'Malta Job Market Outlook 2026 | Careers.mt',
  description: 'In-depth analysis of emerging trends, top industries, and skills in demand for Malta’s 2026 job market.',
};

export default function BlogPost() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16 text-slate-800 leading-relaxed text-lg">
      <header>
        <Button variant="outline" asChild className="-ml-4 mb-4">
            <Link href="/blog">← Back to blog</Link>
        </Button>
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">January 5, 2026</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-slate-900 leading-tight">
          Malta Job Market Outlook 2026: Trends & Insights
        </h1>
      </header>

      <div className="prose prose-slate lg:prose-lg max-w-none">
        <p>
          As we enter 2026, Malta&apos;s job market continues to evolve, driven by digital transformation and a steady demand for specialized skills. From the growing tech sector in Gżira to the financial hubs in Valletta, opportunities abound for those with the right expertise.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-slate-900">1. The Tech Surge</h2>
        <p>
          Artificial intelligence and software engineering remain at the forefront. Maltese companies are increasingly looking for developers who can integrate AI into traditional business workflows.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-slate-900">2. Remote & Hybrid Flexibility</h2>
        <p>
          The hybrid model is now the standard in Malta. Verified employers on Careers.mt are increasingly offering 3-day office weeks, making Sliema and St. Julians even more attractive for international talent.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-slate-900">Conclusion</h2>
        <p>
          Staying competitive in 2026 requires a focus on continuous learning. Follow our blog for more updates on Malta&apos;s ever-changing career landscape.
        </p>
      </div>
    </main>
  );
}
