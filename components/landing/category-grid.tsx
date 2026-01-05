import Link from "next/link";
import { 
  Code2, 
  BarChart3, 
  Building2, 
  UtensilsCrossed, 
  Stethoscope, 
  Scale 
} from "lucide-react";

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
    <section className="bg-slate-50 py-24 border-y border-slate-100">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-4 mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-black tracking-tight text-charcoal sm:text-4xl">
            Sectors in Demand.
          </h2>
          <p className="text-lg font-medium text-slate-500 leading-relaxed">
            Real-time opportunities across Malta&apos;s fastest-growing industries. Verified roles updated daily.
          </p>
        </div>

        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {industries.map((industry) => (
            <Link
              key={industry.slug}
              href={`/jobs/industry/${industry.slug}`}
              className="group flex flex-col items-center gap-6 p-10 rounded-3xl bg-white border border-slate-100 transition-all duration-300 hover:border-brand-primary hover:shadow-premium hover:-translate-y-1"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 shadow-sm transition-all duration-300 group-hover:bg-brand-gradient group-hover:text-white group-hover:scale-110">
                <industry.icon className="h-7 w-7" />
              </div>
              <h3 className="text-sm font-black text-charcoal transition-colors group-hover:text-brand-primary uppercase tracking-widest text-center">
                {industry.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}