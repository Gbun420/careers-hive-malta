import { ShieldCheck, Flag, Bell, Search } from "lucide-react";
import { MetricResult } from "@/lib/metrics";

type FeatureGridProps = {
  metrics: MetricResult;
  showSearch: boolean;
};

export default function FeatureGrid({ metrics, showSearch }: FeatureGridProps) {
  const verifiedPostingsPct = metrics.verified_postings_pct?.value;

  const features = [
    {
      title: "Verified Employers",
      description: verifiedPostingsPct && verifiedPostingsPct !== "N/A"
        ? `${verifiedPostingsPct}% of our job feed comes from manually verified Maltese businesses.`
        : "Every employer is manually reviewed by our team to ensure high-quality, legitimate opportunities.",
      icon: ShieldCheck,
      color: "text-navy-600",
      bg: "bg-navy-50"
    },
    {
      title: "Zero Spam Policy",
      description: "Spot something suspicious? Our moderation pipeline handles job reports in real-time to keep the market clean.",
      icon: Flag,
      color: "text-coral-500",
      bg: "bg-coral-50"
    },
    {
      title: "Custom Alert Frequency",
      description: "Choose between instant, daily, or weekly digests. Never miss a matching role in your industry.",
      icon: Bell,
      color: "text-navy-950",
      bg: "bg-slate-100"
    }
  ];

  if (showSearch) {
    features.push({
      title: "Fast MeiliSearch",
      description: "Find your next role in milliseconds with our lightning-fast search indexing and filters.",
      icon: Search,
      color: "text-navy-600",
      bg: "bg-navy-50"
    });
  }

  return (
    <section className="py-24 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-black tracking-tight text-navy-950 sm:text-4xl">
            Built for Trust. Engineered for Speed.
          </h2>
          <p className="mt-4 text-lg font-medium text-slate-500">
            Malta&apos;s job market is competitive. We give you the tools and verification you need to stay ahead.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.slice(0, 3).map((feature) => (
            <div key={feature.title} className="group rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-sm transition-all hover:shadow-premium">
              <div className={`mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bg} ${feature.color}`}>
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-navy-950">{feature.title}</h3>
              <p className="mt-4 leading-relaxed text-slate-500 font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
