import Link from "next/link";
import RecommendedJobs from "@/components/jobs/recommended-jobs";
import ProfileCompleteness from "@/components/profile/profile-completeness";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";

export default function JobseekerDashboard() {
  return (
    <PageShell>
      <header className="mb-12">
        <SectionHeading 
          title="Jobseeker Command" 
          subtitle="Manage alert streams and optimize search results."
        />
      </header>

      <section className="grid gap-10 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-10">
          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-navy-400">Match Readiness</h2>
            <ProfileCompleteness />
          </div>

          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-navy-400">Operations Center</h2>
            <div className="grid gap-4">
              <Link
                href="/jobseeker/alerts"
                className="rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-brand-primary hover:shadow-premium group"
              >
                <p className="font-black text-slate-950 group-hover:text-brand-primary transition-colors uppercase tracking-widest text-[10px]">Alert preferences</p>
                <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">
                  Update saved searches and delivery settings.
                </p>
              </Link>
              <Link
                href="/profile"
                className="rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-brand-primary hover:shadow-premium group"
              >
                <p className="font-black text-slate-950 group-hover:text-brand-primary transition-colors uppercase tracking-widest text-[10px]">Professional Profile</p>
                <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">
                  Sync your resume and manage skills.
                </p>
              </Link>
              <Link
                href="/settings"
                className="rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-brand-primary hover:shadow-premium group"
              >
                <p className="font-black text-slate-950 group-hover:text-brand-primary transition-colors uppercase tracking-widest text-[10px]">Account settings</p>
                <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">
                  Update your security and preferences.
                </p>
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-navy-400">Personalized Feed</h2>
          <RecommendedJobs />
        </div>
      </section>
    </PageShell>
  );
}
