import Link from "next/link";
import { Badge } from "./badge";
import { MapPin, Calendar, ArrowRight, Zap, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type JobCardProps = {
  id: string;
  title: string;
  employerName: string;
  location: string;
  salaryRange?: string;
  createdAt: string;
  isFeatured?: boolean;
  isVerified?: boolean;
  isAggregated?: boolean;
  matchScore?: number;
};

export function JobCard({
  id,
  title,
  employerName,
  location,
  salaryRange,
  createdAt,
  isFeatured,
  isVerified = true,
  isAggregated,
  matchScore = 98
}: JobCardProps) {
  return (
    <Link
      href={`/job/${id}`}
      className={cn(
        "group relative flex flex-col gap-6 rounded-4xl border p-8 transition-all duration-500",
        "bg-white/80 backdrop-blur-sm hover:shadow-premium hover:-translate-y-1",
        isFeatured
          ? "border-secondary/30 ring-1 ring-secondary/10 shadow-gold-glow"
          : "border-slate-100 hover:border-primary/20"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-4 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            {isVerified && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-teal/10 text-brand-teal text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck className="h-3 w-3" />
                Vetted Brand
              </div>
            )}
            {isFeatured && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary-foreground text-[10px] font-black uppercase tracking-widest">
                Premium Partner
              </div>
            )}
            {isAggregated && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                Aggregated
              </div>
            )}
            <div className="ml-auto inline-flex items-center gap-1 text-brand-navy font-black text-xs">
              <Zap className="h-3 w-3 fill-secondary text-secondary" />
              {matchScore}% Match
            </div>
          </div>

          <h3 className="text-2xl font-black text-brand-navy leading-tightest group-hover:gradient-text transition-all">
            {title}
          </h3>
          
          <div className="flex items-center gap-3 text-sm font-bold text-slate-400 uppercase tracking-widest">
            {employerName}
          </div>
        </div>

        <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-brand-navy group-hover:text-white transition-all duration-500 shadow-sm">
          <ArrowRight className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-4 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {location}
          </div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            {new Date(createdAt).toLocaleDateString()}
          </div>
        </div>
        
        {salaryRange && (
          <div className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-black text-brand-navy bg-slate-50 border border-slate-100 shadow-sm">
            {salaryRange}
          </div>
        )}
      </div>
    </Link>
  );
}
