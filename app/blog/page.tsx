import { Metadata } from 'next';
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: 'Malta Career Blog - Job Search Tips & Employment Trends | Careers.mt',
  description: 'Stay updated with the latest Malta job market insights, career advice, and employment trends for Maltese job seekers.',
};

const blogPosts = [
  {
    slug: 'malta-job-market-2026',
    title: 'Malta Job Market Outlook 2026: Trends & Insights',
    excerpt: 'Explore the emerging industries and skills in demand across Malta for 2026.',
    date: '2026-01-05'
  },
  {
    slug: 'top-companies-malta-2026',
    title: 'Top Companies Hiring in Malta this Year',
    excerpt: 'A guide to the most active employers and best workplaces in Malta for 2026.',
    date: '2026-01-04'
  },
  {
    slug: 'malta-salary-guide-2026',
    title: 'Malta Salary Guide 2026: Industry Benchmarks',
    excerpt: 'Compare your salary against the latest industry averages in the Maltese market.',
    date: '2026-01-03'
  }
];

export default function BlogPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-10 px-6 py-16">
      <header>
        <h1 className="font-display text-4xl font-bold text-slate-900">
          Malta Career Blog
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Expert advice on finding your next role in Malta, from salary benchmarks to interview tips.
        </p>
      </header>

      <section className="grid gap-8">
        {blogPosts.map((post) => (
          <article key={post.slug} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-500/30">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{post.date}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 group-hover:text-teal-600">
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="mt-3 text-slate-600">{post.excerpt}</p>
            <Link 
              href={`/blog/${post.slug}`}
              className="mt-4 inline-block text-sm font-semibold text-teal-600 hover:underline"
            >
              Read more →
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
