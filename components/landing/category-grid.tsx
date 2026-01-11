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
    <section className="bg-muted/30 py-14 md:py-20 border-y border-border">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-center text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-black tracking-tightest text-foreground sm:text-4xl uppercase">
            Sectors in Demand.
          </h2>
          <p className="mt-4 text-lg font-medium text-muted-foreground leading-relaxed">
            Real-time opportunities across Malta&apos;s fastest-growing industries. Verified roles across the islands.
          </p>
        </div>

        <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {industries.map((industry) => (
            <Link
              key={industry.slug}
              href={`/jobs/industry/${industry.slug}`}
              className="group flex flex-col items-center justify-center gap-3 md:gap-4 p-6 md:p-8 rounded-2xl bg-card border border-border transition-all duration-300 hover:border-brand hover:shadow-lg hover:-translate-y-1"
              aria-label={`Browse ${industry.name} jobs in Malta`}
            >
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground shadow-sm transition-all duration-300 group-hover:bg-brand group-hover:text-white group-hover:scale-110">
                <industry.icon className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <h3 className="text-[10px] md:text-xs font-bold text-foreground transition-colors group-hover:text-brand uppercase tracking-wider text-center truncate w-full">
                {industry.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}