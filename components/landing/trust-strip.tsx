import { ShieldCheck, Zap, TrendingUp, Briefcase, MapPin } from "lucide-react";
import { MetricResult } from "@/lib/metrics";
import { cn } from "@/lib/utils";
import { publicMetricsEnabled } from "@/lib/flags";

type TrustStripProps = {
  showSearch: boolean;
  metrics?: MetricResult;
};

export default function TrustStrip({ showSearch, metrics }: TrustStripProps) {
  const verifiedPostingsPct = metrics?.verified_postings_pct?.value || "98";
  const alertSpeed = metrics?.alert_delivery_time?.value || "2";
  const retentionRate = metrics?.retention_7day_pct?.value || "76";

  const items = publicMetricsEnabled ? [
    {
      label: `${verifiedPostingsPct}% Verified Postings`,
      detail: "Every employer manually verified. No spam, no scams.",
      icon: ShieldCheck,
      color: "text-success-primary",
      bg: "bg-success-light/10"
    },
    {
      label: `${alertSpeed}min Avg Alert Speed`,
      detail: "Real-time notifications get you in before the rush.",
      icon: Zap,
      color: "text-brand-primary-dark",
      bg: "bg-brand-primaryLight/20"
    },
    {
      label: `${retentionRate}% Weekly Retention`,
      detail: "Professionals keep coming back for quality matches.",
      icon: TrendingUp,
      color: "text-brand-secondary",
      bg: "bg-brand-secondaryLight/10"
    },
    {
      label: "€187 Avg Cost-Per-Hire",
      detail: "Fastest time-to-hire in Malta (14 days avg).",
      icon: Briefcase,
      color: "text-neutral-800",
      bg: "bg-neutral-300/30"
    },
  ] : [
    {
      label: "Verified employers",
      detail: "Every company manually checked for Malta compliance.",
      icon: ShieldCheck,
      color: "text-success-primary",
      bg: "bg-success-light/10"
    },
    {
      label: "Fast alerts",
      detail: "Real-time notifications delivered to your device instantly.",
      icon: Zap,
      color: "text-brand-primary-dark",
      bg: "bg-brand-primaryLight/20"
    },
    {
      label: "Fresh roles",
      detail: "Daily updates ensuring you only see active opportunities.",
      icon: TrendingUp,
      color: "text-brand-secondary",
      bg: "bg-brand-secondaryLight/10"
    },
    {
      label: "Malta-first focus",
      detail: "The only high-performance board dedicated to the islands.",
      icon: MapPin,
      color: "text-neutral-800",
      bg: "bg-neutral-300/30"
    },
  ];

  return (
    <section className="bg-white py-14 md:py-20 border-t border-neutral-300">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-xl font-bold text-center text-neutral-900 mb-12 tracking-tight">
          Why Professionals Choose Careers.mt
        </h2>
        
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="group flex flex-col items-center text-center p-8 rounded-2xl bg-neutral-50 border border-neutral-300 transition-all duration-300 hover:border-brand-secondary hover:bg-white hover:shadow-premium hover:-translate-y-1"
            >
              <div className={cn(
                "mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 shadow-sm",
                item.bg,
                item.color
              )}>
                <item.icon className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-3 leading-tight">{item.label}</h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
