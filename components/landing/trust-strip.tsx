import { Bell, Flag, ShieldCheck, Search } from "lucide-react";

type TrustStripProps = {
  showSearch: boolean;
};

export default function TrustStrip({ showSearch }: TrustStripProps) {
  const items = [
    {
      label: "Verified employers",
      detail: "Requests reviewed by the team.",
      icon: ShieldCheck,
    },
    {
      label: "Report suspicious jobs",
      detail: "Built-in moderation pipeline.",
      icon: Flag,
    },
    {
      label: "Instant / daily / weekly alerts",
      detail: "Control frequency and noise.",
      icon: Bell,
    },
  ];

  if (showSearch) {
    items.push({
      label: "Powered by fast search",
      detail: "Meilisearch-backed results.",
      icon: Search,
    });
  }

  return (
    <section className="border-y border-slate-200/50 bg-white/40 backdrop-blur-sm">
      <div className="mx-auto grid w-full max-w-6xl gap-4 px-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-3 rounded-[2rem] border border-slate-200/40 bg-white/60 p-4 shadow-sm"
          >
            <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 shadow-inner-soft">
              <item.icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-950 tracking-tight">
                {item.label}
              </p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
