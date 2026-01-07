import { ShieldCheck, Zap, TrendingUp, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/brand";

export default function TrustStrip() {
  const items = [
    {
      label: "Verified employers",
      detail: "Every company manually checked for Malta compliance.",
      icon: ShieldCheck,
      color: "text-brand",
      bg: "bg-brand/5"
    },
    {
      label: "Fast alerts",
      detail: "Real-time notifications delivered to your device instantly.",
      icon: Zap,
      color: "text-brand",
      bg: "bg-brand/5"
    },
    {
      label: "Fresh roles",
      detail: "Daily updates ensuring you only see active opportunities.",
      icon: TrendingUp,
      color: "text-brand",
      bg: "bg-brand/5"
    },
    {
      label: "Malta-first focus",
      detail: "The only high-performance board dedicated to the islands.",
      icon: MapPin,
      color: "text-brand",
      bg: "bg-brand/5"
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
              className="group flex flex-col items-center text-center p-8 rounded-2xl bg-muted/30 border border-border transition-all duration-300 hover:border-brand hover:bg-card hover:shadow-lg hover:-translate-y-1"
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