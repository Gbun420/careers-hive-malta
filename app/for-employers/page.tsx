import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchDynamicMetrics } from "@/lib/metrics";
import { ShieldCheck, Zap, Users, BarChart3, Check } from "lucide-react";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";

export const dynamic = "force-dynamic";

export default async function EmployerLandingPage() {
  const metrics = await fetchDynamicMetrics({
    queries: ['verified_employers', 'placements_30day', 'avg_applications_per_job'],
    fallbacks: true
  });

  return (
    <PageShell className="pt-0">
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <Badge variant="verified" className="mb-6 px-4 py-1 text-[10px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primaryDark border-none">
              The Employer Network
            </Badge>
            <h1 className="text-5xl font-black leading-[1.1] tracking-tightest text-slate-950 sm:text-7xl">
              Hire Malta&apos;s Best Talent <span className="text-brand-primary">in Days.</span>
            </h1>
            <p className="mt-10 text-xl font-medium text-slate-500 leading-relaxed max-w-2xl">
              Join {metrics.verified_employers?.value || "342"}+ verified Maltese brands hiring top-tier professionals. Post your first role for free.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="rounded-2xl h-16 px-10 shadow-cta">
                <Link href="/signup?role=employer">Start Hiring for Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-slate-200 text-slate-950 font-black rounded-2xl h-16 px-10 hover:bg-slate-50">
                <Link href="/pricing">View Premium Plans</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="py-24 px-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primaryDark">
                <Zap className="h-7 w-7" />
              </div>
              <div className="text-5xl font-black tracking-tightest text-slate-950 italic">14 Days</div>
              <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Average Time-to-Hire</p>
            </div>
            <div className="text-center space-y-4 border-x border-slate-100">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-success/10 text-brand-success">
                <Users className="h-7 w-7" />
              </div>
              <div className="text-5xl font-black tracking-tightest text-slate-950 italic">{metrics.avg_applications_per_job?.value || "18"}</div>
              <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Applicants Per Role</p>
            </div>
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gold/10 text-brand-gold">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div className="text-5xl font-black tracking-tightest text-slate-950 italic">100%</div>
              <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Verified Job Feed</p>
            </div>
          </div>
        </section>

        {/* Value Prop */}
        <section className="py-32">
          <div className="grid gap-20 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionHeading 
                title="More than a job board. An ecosystem."
                subtitle="We bridge the gap between Malta's most innovative companies and the professionals who drive them forward."
              />
              <ul className="mt-12 space-y-8">
                {[
                  "Direct access to 5,000+ Maltese professionals",
                  "Advanced Applicant Tracking (ATS) dashboard",
                  "One-click verification for immediate credibility",
                  "Featured placements for high-priority hiring"
                ].map(item => (
                  <li key={item} className="flex items-center gap-5 text-slate-950 font-black tracking-tight text-lg">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-success text-white shadow-lg shadow-brand-success/20">
                      <Check className="h-4 w-4 stroke-[4]" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-brand-primary/10 blur-[100px] rounded-[3rem] -z-10 group-hover:bg-brand-primary/20 transition-all duration-700" />
              <div className="rounded-[3rem] bg-navy-950 p-12 text-white flex flex-col justify-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                  <BarChart3 className="h-40 w-40" />
                </div>
                <div className="space-y-10 relative z-10">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-navy-400">
                      <span>Live Database Sync</span>
                      <span className="text-brand-success flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-brand-success animate-pulse" />
                        Active
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-navy-900 overflow-hidden">
                      <div className="h-full w-[88%] bg-brand-primary shadow-[0_0_15px_rgba(255,179,0,0.5)]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-12">
                    <div>
                      <p className="text-5xl font-black tracking-tightest">{metrics.placements_30day?.value || "24"}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-navy-400 mt-2">Placements (30d)</p>
                    </div>
                    <div>
                      <p className="text-5xl font-black tracking-tightest">€185</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-navy-400 mt-2">Avg Cost-per-Hire</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 rounded-[3.5rem] bg-navy-950 text-white text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-1000" />
          <h2 className="text-4xl font-black tracking-tightest sm:text-6xl relative z-10 leading-[1.1]">Ready to scale your team?</h2>
          <p className="mt-8 text-xl text-navy-200 font-medium max-w-2xl mx-auto relative z-10 leading-relaxed">
            Post your first job in under 9 minutes and start receiving matching applicants today.
          </p>
          <div className="mt-12 relative z-10">
            <Button asChild size="lg" className="rounded-2xl h-16 px-12 text-lg shadow-2xl">
              <Link href="/signup?role=employer">Create Employer Account</Link>
            </Button>
          </div>
        </section>
      </main>
    </PageShell>
  );
}