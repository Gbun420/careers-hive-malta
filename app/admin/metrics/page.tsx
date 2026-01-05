import { fetchDynamicMetrics } from "@/lib/metrics";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Shield, Activity, Clock, Users, Briefcase, Zap, CheckCircle, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MetricsDashboard() {
  const allMetrics = [
    'active_job_seekers', 
    'total_job_postings', 
    'verified_employers', 
    'alert_delivery_time', 
    'verified_postings_pct', 
    'featured_adoption_rate',
    'verification_approval_days', 
    'avg_applications_per_job'
  ];

  const metrics = await fetchDynamicMetrics({ queries: allMetrics, fallbacks: true });

  const getIcon = (key: string) => {
    switch (key) {
      case 'active_job_seekers': return <Users className="h-5 w-5" />;
      case 'total_job_postings': return <Briefcase className="h-5 w-5" />;
      case 'verified_employers': return <Shield className="h-5 w-5" />;
      case 'alert_delivery_time': return <Zap className="h-5 w-5" />;
      case 'verified_postings_pct': return <CheckCircle className="h-5 w-5" />;
      case 'featured_adoption_rate': return <BarChart3 className="h-5 w-5" />;
      case 'verification_approval_days': return <Clock className="h-5 w-5" />;
      case 'avg_applications_per_job': return <Activity className="h-5 w-5" />;
      case 'placements_30day': return <CheckCircle className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <PageShell>
      <header className="mb-12">
        <SectionHeading 
          title="System Metrics" 
          subtitle="Real-time performance monitoring and data freshness audit."
        />
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(metrics).map(([key, data]) => (
          <div 
            key={key} 
            className={`relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md ${
              data.isStale ? "border-rose-200 ring-1 ring-rose-100" : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`rounded-xl p-2.5 ${data.isStale ? "bg-rose-50 text-rose-600" : "bg-brand-primary/10 text-brand-primary"}`}>
                {getIcon(key)}
              </div>
              {data.isStale && (
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700">
                  Stale
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                {key.replace(/_/g, ' ')}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black tabular-nums text-slate-950">
                  {data.value}
                </span>
                {(key === 'verified_postings_pct' || key === 'featured_adoption_rate' || key === 'retention_7day_pct') ? (
                  <span className="text-lg font-bold text-slate-400">%</span>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-1.5 border-t border-slate-50 pt-4">
              <div className={`h-1.5 w-1.5 rounded-full ${data.isStale ? "bg-rose-500" : "bg-brand-success animate-pulse"}`} />
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                Synced: {new Date(data.lastUpdated).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-3xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
        <h2 className="text-xl font-black text-slate-950 mb-4 tracking-tight">Data Freshness Policy</h2>
        <div className="grid gap-6 text-sm text-slate-600 sm:grid-cols-2 max-w-4xl mx-auto text-left">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-brand-primary shrink-0" />
            <p className="font-medium leading-relaxed">Metrics are cached using <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs border border-slate-200">unstable_cache</code> with a 1-hour revalidation window for optimal system performance.</p>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-brand-primary shrink-0" />
            <p className="font-medium leading-relaxed">Stale markers trigger automatically if the database has not been polled within the specified threshold for each specific metric.</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
