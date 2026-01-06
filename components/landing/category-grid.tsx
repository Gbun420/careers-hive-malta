import Link from "next/link";
import { 
  Code2, 
  BarChart3, 
  Building2, 
  UtensilsCrossed, 
  Stethoscope, 
  Scale 
} from "lucide-react";
import { publicMetricsEnabled } from "@/lib/flags";

const industries = [
  { name: "IT & Tech", slug: "it", icon: Code2 },
  { name: "Marketing", slug: "marketing", icon: BarChart3 },
  { name: "Finance", slug: "finance", icon: Building2 },
  { name: "Hospitality", slug: "hospitality", icon: UtensilsCrossed },
  { name: "Healthcare", slug: "healthcare", icon: Stethoscope },
  { name: "Legal", slug: "legal", icon: Scale },
];

export default function CategoryGrid() {
  return (
    <section className="bg-slate-50 py-14 md:py-20 border-y border-slate-100">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-center text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Sectors in Demand.
          </h2>
          <p className="mt-4 text-lg font-medium text-muted-foreground leading-relaxed">
            Real-time opportunities across Malta&apos;s fastest-growing industries. {publicMetricsEnabled ? "Verified roles updated daily." : "Verified roles across the islands."}
          </p>
        </div>

        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {industries.map((industry) => (
            <Link
              key={industry.slug}
              href={`/jobs/industry/${industry.slug}`}
              className="group flex flex-col items-center justify-center gap-4 p-8 rounded-2xl bg-white border border-slate-200 transition-all duration-300 hover:border-brand-primary hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 shadow-sm transition-all duration-300 group-hover:bg-brand-primary group-hover:text-white group-hover:scale-110">
                <industry.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xs font-bold text-foreground transition-colors group-hover:text-brand-primary uppercase tracking-wider text-center">
                {industry.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}