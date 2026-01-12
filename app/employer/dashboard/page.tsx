import Link from "next/link";
import ApplicantTracker from "@/components/employer/applicant-tracker";
import EnhancedDashboardStats from "@/components/employer/enhanced-dashboard-stats";
import { PageShell } from "@/components/ui/page-shell";
import { Briefcase, ShieldCheck, Settings, Eye, BarChart3, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { getEmployerStats } from "@/lib/employer/dashboard";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const dynamic = "force-dynamic";

export default async function EmployerDashboard() {
  const supabase = createRouteHandlerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  const stats = user
    ? await getEmployerStats(user.id)
    : {
        jobCount: 0,
        applicationCount: 0,
        featuredJobs: [],
        views: 0,
        avgTimeToHire: 21,
        conversionRate: 15,
      };

  const operations = [
    {
      title: "Manage job posts",
      description: "Create, edit, and track active listings.",
      href: "/employer/jobs",
      icon: Briefcase,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Company Verification",
      description: "Request your verified badge for trust.",
      href: "/employer/verification",
      icon: ShieldCheck,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "ROI & Analytics",
      description: "Track your hiring funnel performance.",
      href: "/employer/analytics",
      icon: BarChart3,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Account settings",
      description: "Profile and preferences management.",
      href: "/settings",
      icon: Settings,
      color: "text-slate-500",
      bg: "bg-slate-500/10",
    },
  ];

  return (
    <PageShell>
      <ScrollReveal>
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
               <Sparkles className="h-3 w-3" />
               Command Center
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black tracking-tightest text-primary uppercase leading-none">
              Employer <span className="text-secondary">Hub</span>.
            </h1>
            <p className="text-lg font-medium text-slate-500 max-w-xl">
              Optimize your recruitment funnel and secure top Maltese talent.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/jobs"
              className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-slate-50 hover-lift transition-all shadow-sm"
            >
              <Eye className="h-4 w-4" /> View Public Feed
            </Link>
            <Link
              href="/employer/jobs/new"
              className="flex items-center gap-2 rounded-2xl bg-secondary px-6 py-4 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-secondary/90 hover-lift shadow-cta transition-all"
            >
              <Plus className="h-4 w-4" /> Post New Job
            </Link>
          </div>
        </header>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <EnhancedDashboardStats stats={stats} />
      </ScrollReveal>

      <section className="grid gap-12 lg:grid-cols-[1fr_2.5fr] mt-12">
        <div className="space-y-8">
          <ScrollReveal delay={200} className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Operations Center
            </h2>
            <div className="grid gap-4">
              {operations.map((op) => (
                <Link
                  key={op.href}
                  href={op.href}
                  className="bg-white border border-slate-200 hover:border-secondary/40 hover-lift rounded-[2rem] group p-6 flex flex-col gap-4 shadow-sm transition-all"
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

          <ScrollReveal delay={300}>
            <div className="rounded-[2.5rem] bg-primary p-8 text-white relative overflow-hidden group shadow-premium hover-lift">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-secondary/10 blur-[80px] group-hover:bg-secondary/20 transition-colors" />
              <div className="relative z-10 space-y-6">
                <h3 className="font-display font-black italic text-2xl uppercase tracking-tighter text-white">
                  Pro <span className="text-secondary">Member</span>
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  Featured posts get 3x more visibility on the main feed and weekly newsletter.
                </p>
                <Link
                  href="/pricing"
                  className="block text-center rounded-2xl bg-white/10 hover:bg-white/20 px-4 py-4 text-[10px] font-black uppercase tracking-widest transition-all text-white border border-white/10"
                >
                  Upgrade Membership
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={400} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Active Applicant Pipeline
            </h2>
            <Link
              href="/employer/applications"
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-secondary transition-colors"
            >
              Full Tracker →
            </Link>
          </div>
          <div className="bg-white rounded-[3rem] border border-slate-200 p-2 overflow-hidden shadow-sm">
            <ApplicantTracker />
          </div>
        </ScrollReveal>
      </section>
    </PageShell>
  );
}