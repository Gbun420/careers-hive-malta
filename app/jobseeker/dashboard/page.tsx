import Link from "next/link";
import EnhancedRecommendedJobs from "@/components/jobs/enhanced-recommended-jobs";
import ProfileCompleteness from "@/components/profile/profile-completeness";
import { PageShell } from "@/components/ui/page-shell";
import { Bell, User, Settings, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 animate-fade-down">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tightest text-slate-950 uppercase">
            Jobseeker <span className="gradient-text">Command</span>.
          </h1>
          <p className="text-lg font-medium text-slate-500 max-w-xl">
            Streamline your career growth and stay ahead in the Maltese market.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/jobs"
            className="flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-brand/90 hover-lift shadow-brand/20 transition-all"
          >
            Explore All Jobs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="grid gap-12 lg:grid-cols-[1fr_2.5fr]">
        <div className="space-y-10 animate-fade-left">
          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Match Readiness
            </h2>
            <div className="glass-card rounded-[2.5rem] border-border/40 p-1 overflow-hidden">
              <ProfileCompleteness />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Operations Center
            </h2>
            <div className="grid gap-4">
              {operations.map((op) => (
                <Link
                  key={op.href}
                  href={op.href}
                  className="glass-card hover-lift rounded-3xl group border-border/40 p-6 flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between">
                    <div className={cn("p-2.5 rounded-xl", op.bg, op.color)}>
                      <op.icon className="h-5 w-5" />
                    </div>
                    <div className="h-1.5 w-1.5 rounded-full bg-brand opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-950 group-hover:text-brand transition-colors uppercase tracking-widest text-[11px]">
                      {op.title}
                    </h3>
                    <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">
                      {op.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand animate-pulse" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                AI-Powered Recommendations
              </h2>
            </div>
            <Link
              href="/jobs"
              className="text-[10px] font-black uppercase tracking-widest text-brand hover:underline"
            >
              View Feed →
            </Link>
          </div>
          <div className="glass-card rounded-[3rem] border-border/40 p-1 overflow-hidden">
            <EnhancedRecommendedJobs />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
