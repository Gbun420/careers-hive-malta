import { BarChart3, TrendingUp, Users, Eye, ArrowUpRight, Target, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EmployerAnalyticsPage() {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return <div>Database connection error.</div>;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 1. Fetch Employer Data
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, is_active, views_count, application_count")
    .eq("employer_id", user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("verification_status")
    .eq("id", user.id)
    .single();

  // 2. Aggregate Metrics
  const activePostings = jobs?.filter(j => j.is_active).length || 0;
  const totalViews = jobs?.reduce((sum, j) => sum + (j.views_count || 0), 0) || 0;
  const totalApplications = jobs?.reduce((sum, j) => sum + (j.application_count || 0), 0) || 0;
  const conversionRate = totalViews > 0 
    ? ((totalApplications / totalViews) * 100).toFixed(1) + "%" 
    : "0%";

  const isVerified = profile?.verification_status === 'approved';

  const kpis = [
    { label: "Active Postings", value: activePostings.toString(), icon: BarChart3, trend: "Live" },
    { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye, trend: "Lifetime" },
    { label: "Applications", value: totalApplications.toLocaleString(), icon: Users, trend: "Lifetime" },
    { label: "Conversion Rate", value: conversionRate, icon: Target, trend: "Avg per view" }
  ];

  return (
    <PageShell>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <SectionHeading 
          title="Performance Analytics" 
          subtitle="Track your hiring funnel and optimize for Maltese talent."
        />
        <Badge variant="verified" className="h-fit py-2 px-4 border-none">Live System Feed</Badge>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                <kpi.icon className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">
                <TrendingUp className="h-3 w-3" /> {kpi.trend}
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{kpi.label}</p>
            <p className="mt-1 text-3xl font-black text-navy-950">{kpi.value}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-8 lg:grid-cols-2 mt-12">
        <div className="rounded-[2.5rem] border border-navy-100 bg-navy-950 p-10 text-white shadow-xl">
          <h3 className="text-xl font-black">Hiring Efficiency</h3>
          <p className="mt-2 text-sm text-navy-300 font-medium leading-relaxed">
            Your verification status and job performance impact your visibility.
          </p>
          
          <div className="mt-10 space-y-8">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-navy-400">
                <span>Employer Brand Trust</span>
                <span className={isVerified ? "text-emerald-400" : "text-amber-400"}>
                  {isVerified ? "Verified" : "Pending / Unverified"}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-navy-900 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${isVerified ? "bg-emerald-500 w-full" : "bg-amber-500 w-1/3"}`} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-sm flex flex-col justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand/90 mb-6">
            <ArrowUpRight className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-black text-navy-950">Boost Conversion.</h3>
          <p className="mt-4 text-lg font-medium text-slate-500 leading-relaxed">
            Featured listings are currently receiving <span className="text-navy-950 font-bold">3.2x more views</span> and <span className="text-navy-950 font-bold">2.8x more applications</span> across the network.
          </p>
          <div className="mt-8">
            <button className="text-[10px] font-black uppercase tracking-widest text-brand/90 hover:text-brand flex items-center gap-2 transition-colors">
              Analyze Boost ROI <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}