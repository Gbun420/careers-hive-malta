import { Metadata } from 'next';
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: 'Ultimate Guide to IT Jobs in Malta 2026 | Careers.mt',
  description: 'Everything you need to know about finding software engineering, data science, and tech roles in Malta.',
};

export default function BlogPost() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16 text-slate-800 leading-relaxed text-lg">
      <header>
        <Button variant="outline" asChild className="-ml-4 mb-4">
            <Link href="/blog">← Back to blog</Link>
        </Button>
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Tech Guide</p>
        <h1 className="mt-2 font-sans text-5xl font-extrabold text-slate-950 leading-tight tracking-tightest">
          Ultimate Guide to IT Jobs in Malta
        </h1>
      </header>

      <div className="prose prose-slate lg:prose-xl max-w-none">
        <p className="lead text-xl text-slate-600">
          Malta has established itself as a Mediterranean tech hub. With a booming iGaming sector and growing Fintech scene, the demand for developers has never been higher.
        </p>
        
        <h2 className="mt-12 text-3xl font-bold text-slate-950 tracking-tight">Where to Look</h2>
        <p>
          Most tech companies are concentrated in the <strong>Sliema, St. Julians, and Gżira</strong> area. These hubs offer not just great offices but a vibrant lifestyle for digital nomads and expats.
        </p>

        <h2 className="mt-12 text-3xl font-bold text-slate-950 tracking-tight">Top Skills in Demand</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li><strong>Frontend:</strong> React, Next.js, and TypeScript.</li>
          <li><strong>Backend:</strong> Node.js, Go, and Python.</li>
          <li><strong>Data:</strong> SQL expertise and AI integration skills.</li>
        </ul>

        <div className="mt-12 rounded-3xl bg-slate-900 p-8 text-white shadow-2xl">
          <h3 className="text-2xl font-bold text-white">Ready to start?</h3>
          <p className="mt-4 text-slate-300">Browse verified tech roles currently active on our platform.</p>
          <Button asChild className="mt-6 bg-brand-500 hover:bg-brand-600">
            <Link href="/jobs/industry/it">View Tech Jobs</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
