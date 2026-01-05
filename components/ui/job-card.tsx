import Link from "next/link";
import { Badge } from "./badge";
import { Briefcase, MapPin, Calendar, ExternalLink } from "lucide-react";
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
};

export function JobCard({
  id,
  title,
  employerName,
  location,
  salaryRange,
  createdAt,
  isFeatured,
  isVerified
}: JobCardProps) {
  return (
    <Link 
      href={`/jobs/${id}`}
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl border bg-white p-6 transition-all",
        isFeatured 
          ? "border-gold-200 bg-gold-50/30 shadow-gold-glow hover:shadow-premium" 
          : "border-slate-200 hover:border-navy-200 hover:shadow-premium"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap gap-2">
            {isFeatured && <Badge variant="featured">Featured</Badge>}
            {isVerified && <Badge variant="verified">Verified Employer</Badge>}
          </div>
          <h3 className="mt-2 text-xl font-bold text-navy-950 group-hover:text-navy-600 transition-colors">
            {title}
          </h3>
          <p className="font-semibold text-slate-600">{employerName}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-2 text-slate-400 group-hover:bg-navy-50 group-hover:text-navy-500 transition-colors">
          <ExternalLink className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-auto flex flex-wrap gap-4 text-sm font-medium text-slate-500">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4" />
          {location}
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {new Date(createdAt).toLocaleDateString()}
        </div>
        {salaryRange && (
          <div className="flex items-center gap-1.5 font-bold text-navy-900">
            {salaryRange}
          </div>
        )}
      </div>

      {isFeatured && (
        <div className="absolute top-0 right-0 h-16 w-16 overflow-hidden rounded-tr-2xl">
          <div className="absolute top-0 right-0 h-[2px] w-[140%] translate-x-[30%] translate-y-[10px] rotate-45 bg-gold-400" />
        </div>
      )}
    </Link>
  );
}
