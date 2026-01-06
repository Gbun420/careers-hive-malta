import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ChevronLeft } from "lucide-react";

interface BlogPostShellProps {
  children: React.ReactNode;
  title: string;
  category: string;
  date: string;
  readingTime: string;
}

export function BlogPostShell({
  children,
  title,
  category,
  date,
  readingTime,
}: BlogPostShellProps) {
  return (
    <PageShell>
      <article className="mx-auto max-w-3xl">
        <header className="mb-12">
          <Button variant="ghost" asChild className="-ml-4 mb-8 text-slate-500 hover:text-brand-primary">
            <Link href="/blog" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Insights
            </Link>
          </Button>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Badge variant="new" className="bg-brand-primary/10 text-brand-primaryDark border-none font-black">
              {category}
            </Badge>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <Calendar className="h-3.5 w-3.5" />
              {date}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-l border-slate-200 pl-4">
              <Clock className="h-3.5 w-3.5" />
              {readingTime}
            </div>
          </div>

          <h1 className="text-4xl font-black tracking-tightest text-slate-950 sm:text-5xl leading-[1.1] mb-8">
            {title}
          </h1>
        </header>

        <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tightest prose-a:text-brand-primary prose-a:font-bold hover:prose-a:text-brand-primaryDark prose-img:rounded-[2.5rem] prose-img:shadow-xl">
          {children}
        </div>

        <footer className="mt-20 pt-12 border-t border-slate-100">
          <div className="rounded-[2.5rem] bg-navy-950 p-10 text-white shadow-premium relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl -mr-32 -mt-32 transition-all duration-500 group-hover:bg-brand-primary/20" />
            
            <div className="relative z-10 max-w-md">
              <h3 className="text-2xl font-black tracking-tight mb-4">Subscribe to Malta Careers</h3>
              <p className="text-navy-200 font-medium mb-8 leading-relaxed">
                Get the latest job trends, relocation guides, and verified opportunities delivered directly to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="name@company.com"
                  className="flex-1 rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm font-medium focus:outline-none focus:border-brand-primary transition-colors"
                />
                <Button className="rounded-xl bg-brand-primary hover:bg-brand-primaryDark text-white font-black px-6 h-12 shadow-lg shadow-brand-primary/20 transition-all">
                  Join Insights
                </Button>
              </div>
            </div>
          </div>
        </footer>
      </article>
    </PageShell>
  );
}
