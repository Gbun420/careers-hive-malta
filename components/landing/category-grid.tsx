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
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-4 mb-16">
          <h2 className="text-3xl font-black tracking-tight text-navy-950 sm:text-4xl">
            Sectors in Demand.
          </h2>
          <p className="max-w-2xl text-lg font-medium text-slate-500">
            Real-time opportunities across Malta&apos;s fastest-growing industries.
          </p>
        </div>

        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {industries.map((industry) => (
            <Link
              key={industry.slug}
              href={`/jobs/industry/${industry.slug}`}
              className="group rounded-3xl border border-slate-100 bg-slate-50/50 p-8 transition-all hover:border-navy-200 hover:bg-white hover:shadow-premium"
            >
              <div className="flex flex-col gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-navy-400 shadow-sm transition-all group-hover:bg-navy-950 group-hover:text-white">
                  <industry.icon className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-black text-navy-950 transition-colors group-hover:text-navy-600">
                  {industry.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}