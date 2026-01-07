import Link from "next/link";
import ApplicantTracker from "@/components/employer/applicant-tracker";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Briefcase, ShieldCheck, Settings, Eye, BarChart3 } from "lucide-react";

export default function EmployerDashboard() {
  return (
    <PageShell>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <SectionHeading 
          title="Employer Command" 
          subtitle="Manage listings and optimize Maltese recruitment speed."
        />
        <div className="flex gap-3">
          <Link 
            href="/jobs" 
            className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-navy-950 hover:bg-slate-50 transition-all"
          >
            <Eye className="h-4 w-4" /> View Public Feed
          </Link>
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-navy-400">Operations</h2>
          <div className="grid gap-4">
            <Link
              href="/employer/jobs"
              className="rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-navy-200 hover:shadow-premium group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                  <Briefcase className="h-4 w-4" />
                </div>
                <p className="font-black text-navy-950 group-hover:text-coral-500 transition-colors uppercase tracking-widest text-[10px]">Manage job posts</p>
              </div>
              <p className="text-xs font-medium text-slate-500">
                Create, edit, and track your active job listings.
              </p>
            </Link>
            
            <Link
              href="/employer/verification"
              className="rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-navy-200 hover:shadow-premium group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-50 text-gold-600">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <p className="font-black text-navy-950 group-hover:text-coral-500 transition-colors uppercase tracking-widest text-[10px]">Company Verification</p>
              </div>
              <p className="text-xs font-medium text-slate-500">
                Request your verified badge to increase candidate trust.
              </p>
            </Link>

            <Link
              href="/employer/analytics"
              className="rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-navy-200 hover:shadow-premium group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral-50 text-coral-600">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <p className="font-black text-navy-950 group-hover:text-coral-500 transition-colors uppercase tracking-widest text-[10px]">ROI & Analytics</p>
              </div>
              <p className="text-xs font-medium text-slate-500">
                Track your hiring funnel and optimize for Maltese talent.
              </p>
            </Link>

            <Link
              href="/settings"
              className="rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-navy-200 hover:shadow-premium group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                  <Settings className="h-4 w-4" />
                </div>
                <p className="font-black text-navy-950 group-hover:text-coral-500 transition-colors uppercase tracking-widest text-[10px]">Account settings</p>
              </div>
              <p className="text-xs font-medium text-slate-500">
                Update company profile and preferences.
              </p>
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-navy-400">Applicant Pipeline</h2>
          <ApplicantTracker />
        </div>
      </section>
    </PageShell>
  );
}
