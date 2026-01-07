import { Metadata } from 'next';
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";

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
    <PageShell>
      <header className="mb-16">
        <SectionHeading 
          title="Career Insights for the Maltese Market" 
          subtitle="Expert advice on finding your next role in Malta, from relocation guides to industry benchmarks."
        />
      </header>

      <section className="grid gap-10 sm:grid-cols-2">
        {blogPosts.map((post) => (
          <article key={post.slug} className="group relative flex flex-col p-10 rounded-[3rem] border border-slate-200 bg-white transition-all duration-300 hover:border-brand hover:shadow-premium hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-brand/10 text-brand text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                {post.category}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{post.date}</span>
            </div>
            <h2 className="text-3xl font-black text-slate-950 group-hover:text-brand transition-colors tracking-tightest leading-tight">
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="mt-6 text-lg text-slate-500 font-medium leading-relaxed flex-1">{post.excerpt}</p>
            <div className="mt-10 pt-8 border-t border-slate-50">
              <Link 
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-950 hover:text-brand transition-all group/link"
              >
                Read full guide
                <span className="text-xl transition-transform group-hover/link:translate-x-1">→</span>
              </Link>
            </div>
          </article>
        ))}
      </section>
    </PageShell>
  );
}