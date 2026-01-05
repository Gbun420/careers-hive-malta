import Link from "next/link";
import { Badge } from "./badge";
import { MapPin, Calendar, ExternalLink, Zap } from "lucide-react";
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
  isVerified,
  matchScore
}: JobCardProps) {
  return (
    <Link 
      href={`/jobs/${id}`}
      className={cn(
        "group relative flex flex-col gap-4 rounded-xl border bg-white p-6 transition-all duration-300 card-interactive",
        isFeatured 
          ? "border-brand-primary/30 card-glass shadow-sun-glow hover:-translate-y-1" 
          : "border-neutral-300 hover:border-brand-secondary hover:shadow-premium hover:-translate-y-1"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap gap-2 mb-2">
            {isFeatured && (
              <Badge variant="featured" className="bg-gradient-primary text-white border-none shadow-sm">
                Featured
              </Badge>
            )}
            {isVerified && (
              <Badge variant="verified" className="bg-brand-secondary text-white border-none">
                ✓ Verified
              </Badge>
            )}
            {matchScore && matchScore >= 50 && (
              <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-success-light/10 text-success-primary">
                <Zap className="h-3 w-3 mr-1 fill-success-primary" />
                {matchScore}% Match
              </div>
            )}
          </div>
          <h3 className="text-lg font-bold text-neutral-900 group-hover:text-brand-secondary transition-colors leading-tight">
            {title}
          </h3>
          <p className="text-sm font-medium text-neutral-500">{employerName}</p>
        </div>
        <div className="rounded-full bg-neutral-100 p-2 text-neutral-500 group-hover:bg-brand-secondary/10 group-hover:text-brand-secondary transition-all">
          <ExternalLink className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-neutral-500 uppercase tracking-wide">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-brand-secondary" />
          {location}
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-brand-secondary" />
          {new Date(createdAt).toLocaleDateString()}
        </div>
        {salaryRange && (
          <div className="flex items-center gap-1.5 font-bold text-neutral-900 bg-brand-primary/10 px-2 py-1 rounded">
            {salaryRange}
          </div>
        )}
      </div>
    </Link>
  );
}