import { Metadata } from 'next';
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: 'Ultimate Guide to IT Jobs in Malta 2026 | Careers.mt',
  description: 'Everything you need to know about finding software engineering, data science, and tech roles in Malta.',
};

import { BlogPostShell } from "@/components/blog/blog-post-shell";

export default function BlogPost() {
  return (
    <BlogPostShell
      title="Ultimate Guide to IT Jobs in Malta"
      category="Tech Guide"
      date="Jan 4, 2026"
      readingTime="6 min read"
    >
      <p className="lead">
        Malta has established itself as a Mediterranean tech hub. With a booming iGaming sector and growing Fintech scene, the demand for developers has never been higher.
      </p>
      
      <h2>Where to Look</h2>
      <p>
        Most tech companies are concentrated in the <strong>Sliema, St. Julians, and Gżira</strong> area. These hubs offer not just great offices but a vibrant lifestyle for digital nomads and expats.
      </p>

      <h2>Top Skills in Demand</h2>
      <ul>
        <li><strong>Frontend:</strong> React, Next.js, and TypeScript.</li>
        <li><strong>Backend:</strong> Node.js, Go, and Python.</li>
        <li><strong>Data:</strong> SQL expertise and AI integration skills.</li>
      </ul>

      <div className="not-prose mt-12 rounded-3xl bg-slate-900 p-8 text-white shadow-2xl">
        <h3 className="text-2xl font-bold text-white">Ready to start?</h3>
        <p className="mt-4 text-slate-300">Browse verified tech roles currently active on our platform.</p>
        <Button asChild className="mt-6 bg-brand hover:bg-brand/90 shadow-lg">
          <Link href="/jobs/industry/it">View Tech Jobs</Link>
        </Button>
      </div>
    </BlogPostShell>
  );
}
