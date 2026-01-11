import Link from "next/link";
import ApplicantTracker from "@/components/employer/applicant-tracker";
import DashboardStats from "@/components/employer/dashboard-stats";
import { PageShell } from "@/components/ui/page-shell";
import { Briefcase, ShieldCheck, Settings, Eye, BarChart3, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { getEmployerStats } from "@/lib/employer/dashboard";

export const dynamic = "force-dynamic";

export default async function EmployerDashboard() {
  const supabase = createRouteHandlerClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  
  const stats = user ? await getEmployerStats(user.id) : { jobCount: 0, applicationCount: 0, featuredJobs: [] };

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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 animate-fade-down">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tightest text-slate-950 uppercase">
            Employer <span className="gradient-text">Command</span>.
          </h1>
          <p className="text-lg font-medium text-slate-500 max-w-xl">
            Optimize your recruitment funnel and secure top Maltese talent.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/jobs"
            className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-950 hover:bg-slate-50 hover-lift transition-all"
          >
            <Eye className="h-4 w-4" /> View Public Feed
          </Link>
          <Link
            href="/employer/jobs/new"
            className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-brand/90 hover-lift shadow-brand/20 transition-all"
          >
            <Plus className="h-4 w-4" /> Post New Job
          </Link>
        </div>
      </header>

      <DashboardStats stats={stats} />

      <section className="grid gap-12 lg:grid-cols-[1fr_2.5fr]">
        <div className="space-y-8 animate-fade-left">
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

          <div className="rounded-[2.5rem] bg-slate-950 p-8 text-white relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-brand/20 blur-[80px] group-hover:bg-brand/30 transition-colors" />
            <div className="relative z-10 space-y-4">
              <h3 className="font-black italic text-xl uppercase tracking-tighter">Pro Recruiter</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Featured posts get 3x more visibility on the main feed and weekly newsletter.
              </p>
              <Link href="/pricing" className="block text-center rounded-xl bg-white/10 hover:bg-white/20 px-4 py-3 text-xs font-black uppercase tracking-widest transition-all">
                Upgrade Now
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Active Applicant Pipeline
            </h2>
            <Link href="/employer/applications" className="text-[10px] font-black uppercase tracking-widest text-brand hover:underline">
              Full Tracker →
            </Link>
          </div>
          <div className="glass-card rounded-[3rem] border-border/40 p-1 overflow-hidden">
            <ApplicantTracker />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
