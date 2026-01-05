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

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {industries.map((industry) => (
          <Link
            key={industry.slug}
            href={`/jobs/industry/${industry.slug}`}
            className="tech-card p-6 rounded-xl group"
          >
            <div className="flex flex-col gap-4">
              <div className="h-10 w-10 rounded border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-500 group-hover:text-white group-hover:border-brand-500 transition-all duration-300">
                <industry.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-950 tracking-tight group-hover:text-brand-600 transition-colors">
                  {industry.name}
                </h3>
                <p className="text-[10px] font-bold font-mono text-slate-400 mt-1 uppercase tracking-widest">
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
