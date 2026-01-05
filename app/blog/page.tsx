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
    date: 'Jan 5, 2026',
    category: 'Market Trends'
  },
  {
    slug: 'it-jobs-malta-guide',
    title: 'Ultimate Guide to IT Jobs in Malta',
    excerpt: 'Find your dream tech role in Sliema or Gżira with our comprehensive guide.',
    date: 'Jan 4, 2026',
    category: 'Tech Guide'
  },
  {
    slug: 'work-permit-malta-2026',
    title: 'Malta Work Permit Guide 2026',
    excerpt: 'Everything you need to know about the Single Permit process for international applicants.',
    date: 'Jan 3, 2026',
    category: 'Relocation'
  },
  {
    slug: 'malta-salary-guide-2026',
    title: 'Malta Salary Guide 2026: Industry Benchmarks',
    excerpt: 'Compare your salary against the latest industry averages in the Maltese market.',
    date: 'Jan 2, 2026',
    category: 'Market Trends'
  }
];

export default function BlogPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-16 px-6 py-20">
      <header className="max-w-3xl">
        <h1 className="font-sans text-6xl font-extrabold text-slate-950 tracking-tightest leading-tight">
          Career Insights for the <span className="text-brand-600">Maltese Market.</span>
        </h1>
        <p className="mt-6 text-xl text-slate-500 leading-relaxed">
          Expert advice on finding your next role in Malta, from relocation guides to industry benchmarks.
        </p>
      </header>

      <section className="grid gap-8 sm:grid-cols-2">
        {blogPosts.map((post) => (
          <article key={post.slug} className="premium-card group block p-8 rounded-[2rem]">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-brand-50 text-brand-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg">
                {post.category}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{post.date}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-950 group-hover:text-brand-600 transition-colors tracking-tight">
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="mt-4 text-slate-500 leading-relaxed">{post.excerpt}</p>
            <Link 
              href={`/blog/${post.slug}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-950 hover:text-brand-600 transition-colors"
            >
              Read full guide
              <span className="text-xl">→</span>
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
