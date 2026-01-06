import { ShieldCheck, Zap, TrendingUp, Briefcase, MapPin } from "lucide-react";
import { MetricResult } from "@/lib/metrics";
import { cn } from "@/lib/utils";
import { publicMetricsEnabled } from "@/lib/flags";
import { BRAND_NAME } from "@/lib/brand";

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
      color: "text-primary",
      bg: "bg-primary/5"
    },
    {
      label: `${alertSpeed}min Avg Alert Speed`,
      detail: "Real-time notifications get you in before the rush.",
      icon: Zap,
      color: "text-primary",
      bg: "bg-primary/5"
    },
    {
      label: `${retentionRate}% Weekly Retention`,
      detail: "Professionals keep coming back for quality matches.",
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/5"
    },
    {
      label: "€187 Avg Cost-Per-Hire",
      detail: "Fastest time-to-hire in Malta (14 days avg).",
      icon: Briefcase,
      color: "text-primary",
      bg: "bg-primary/5"
    },
  ] : [
    {
      label: "Verified employers",
      detail: "Every company manually checked for Malta compliance.",
      icon: ShieldCheck,
      color: "text-primary",
      bg: "bg-primary/5"
    },
    {
      label: "Fast alerts",
      detail: "Real-time notifications delivered to your device instantly.",
      icon: Zap,
      color: "text-primary",
      bg: "bg-primary/5"
    },
    {
      label: "Fresh roles",
      detail: "Daily updates ensuring you only see active opportunities.",
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/5"
    },
    {
      label: "Malta-first focus",
      detail: "The only high-performance board dedicated to the islands.",
      icon: MapPin,
      color: "text-primary",
      bg: "bg-primary/5"
    },
  ];

  return (
    <section className="bg-background py-14 md:py-20 border-t border-border">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-xl font-bold text-center text-foreground mb-12 tracking-tight">
          Why Professionals Choose {BRAND_NAME}
        </h2>
        
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="group flex flex-col items-center text-center p-8 rounded-2xl bg-muted/30 border border-border transition-all duration-300 hover:border-primary hover:bg-card hover:shadow-lg hover:-translate-y-1"
            >
              <div className={cn(
                "mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 shadow-sm",
                item.bg,
                item.color
              )}>
                <item.icon className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-3 leading-tight">{item.label}</h3>
              <p className="text-xs font-medium text-muted-foreground leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
