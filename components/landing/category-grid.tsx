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
  { name: "IT & Technology", slug: "it", icon: Code2, count: "45+ Jobs" },
  { name: "Marketing", slug: "marketing", icon: BarChart3, count: "20+ Jobs" },
  { name: "Finance", slug: "finance", icon: Building2, count: "30+ Jobs" },
  { name: "Hospitality", slug: "hospitality", icon: UtensilsCrossed, count: "15+ Jobs" },
  { name: "Healthcare", slug: "healthcare", icon: Stethoscope, count: "10+ Jobs" },
  { name: "Legal", slug: "legal", icon: Scale, count: "8+ Jobs" },
];

export default function CategoryGrid() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-24">
      <div className="flex flex-col gap-4 mb-16 text-center items-center">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-brand-600">
          Discovery
        </p>
        <h2 className="font-sans text-5xl font-extrabold text-slate-950 tracking-tightest">
          Explore by Industry.
        </h2>
        <p className="max-w-2xl text-lg text-slate-500 mt-2">
          Jump directly into the sectors that matter to you. Verified roles updated daily across all major Maltese industries.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-2 md:grid-cols-3">
        {industries.map((industry) => (
          <Link
            key={industry.slug}
            href={`/jobs/industry/${industry.slug}`}
            className="premium-card p-8 rounded-[2.5rem] group hover:bg-slate-950 transition-colors duration-500"
          >
            <div className="flex flex-col gap-6">
              <div className="h-12 w-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500">
                <industry.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-950 group-hover:text-white transition-colors tracking-tight">
                  {industry.name}
                </h3>
                <p className="text-sm font-semibold text-slate-400 mt-1 group-hover:text-slate-300 transition-colors uppercase tracking-wider">
                  {industry.count}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
