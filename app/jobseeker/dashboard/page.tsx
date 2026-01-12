import Link from "next/link";
import EnhancedRecommendedJobs from "@/components/jobs/enhanced-recommended-jobs";
import ProfileCompleteness from "@/components/profile/profile-completeness";
import { PageShell } from "@/components/ui/page-shell";
import { Bell, User, Settings, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function JobseekerDashboard() {
  const operations = [
    {
      title: "Alert preferences",
      description: "Update saved searches and delivery settings.",
      href: "/jobseeker/alerts",
      icon: Bell,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Professional Profile",
      description: "Sync your resume and manage skills.",
      href: "/profile",
      icon: User,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      title: "Account settings",
      description: "Update your security and preferences.",
      href: "/settings",
      icon: Settings,
      color: "text-slate-500",
      bg: "bg-slate-500/10",
    },
  ];

  return (
    <PageShell>
      <ScrollReveal>
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-2">
            <h1 className="font-display text-4xl md:text-5xl font-black tracking-tightest text-primary uppercase leading-none">
              Jobseeker <span className="text-secondary">Hub</span>.
            </h1>
            <p className="text-lg font-medium text-slate-500 max-w-xl">
              Streamline your career growth and stay ahead in the Maltese market.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/jobs"
              className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-primary/90 hover-lift shadow-sm transition-all"
            >
              Explore All Jobs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>
      </ScrollReveal>

      <section className="grid gap-12 lg:grid-cols-[1fr_2.5fr]">
        <div className="space-y-10">
          <ScrollReveal delay={100} className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Match Readiness
            </h2>
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-2 overflow-hidden shadow-sm">
              <ProfileCompleteness />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200} className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Operations Center
            </h2>
            <div className="grid gap-4">
              {operations.map((op) => (
                <Link
                  key={op.href}
                  href={op.href}
                  className="bg-white hover-lift rounded-[2rem] group border border-slate-200 hover:border-secondary/40 p-6 flex flex-col gap-4 shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className={cn("p-3 rounded-xl transition-colors", "bg-slate-50 group-hover:bg-secondary/20", "text-slate-400 group-hover:text-secondary")}>
                      <op.icon className="h-5 w-5" />
                    </div>
                    <div className="h-1.5 w-1.5 rounded-full bg-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-primary group-hover:text-primary transition-colors uppercase tracking-widest text-[11px]">
                      {op.title}
                    </h3>
                    <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">
                      {op.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={300} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-secondary animate-pulse" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                AI-Powered Recommendations
              </h2>
            </div>
            <Link
              href="/jobs"
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-secondary transition-colors"
            >
              View Feed →
            </Link>
          </div>
          <div className="bg-white rounded-[3rem] border border-slate-200 p-2 overflow-hidden shadow-sm">
            <EnhancedRecommendedJobs />
          </div>
        </ScrollReveal>
      </section>
    </PageShell>
  );
}