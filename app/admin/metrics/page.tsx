import { fetchDynamicMetrics } from "@/lib/metrics";
import SiteHeader from "@/components/nav/site-header";
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
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-2 mb-10">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">SYSTEM METRICS</h1>
          <p className="text-slate-500 font-medium">Real-time performance monitoring and data freshness audit.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(metrics).map(([key, data]) => (
            <div 
              key={key} 
              className={`relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md ${
                data.isStale ? "border-red-200 ring-1 ring-red-100" : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`rounded-xl p-2.5 ${data.isStale ? "bg-red-50 text-red-600" : "bg-brand-50 text-brand-600"}`}>
                  {getIcon(key)}
                </div>
                {data.isStale && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
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
                  {key === 'verified_postings_pct' || key === 'featured_adoption_rate' ? (
                    <span className="text-lg font-bold text-slate-400">%</span>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-1.5 border-t border-slate-50 pt-4">
                <div className={`h-1.5 w-1.5 rounded-full ${data.isStale ? "bg-red-500" : "bg-green-500 animate-pulse"}`} />
                <p className="text-[10px] font-medium text-slate-400">
                  Synced: {new Date(data.lastUpdated).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Data Freshness Policy</h2>
          <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-brand-500" />
              <p>Metrics are cached using <code className="rounded bg-slate-100 px-1 font-mono text-xs">unstable_cache</code> with a 1-hour revalidation window.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-brand-500" />
              <p>Stale markers trigger automatically if the database has not been polled within the specified threshold.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
