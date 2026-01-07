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
  isVerified,
  isAggregated,
  matchScore
}: JobCardProps) {
  return (
    <Link 
      href={`/job/${id}`}
      className={cn(
        "group relative flex flex-col gap-4 rounded-xl border bg-card p-6 transition-all duration-300",
        isFeatured 
          ? "border-brand/50 shadow-md hover:-translate-y-1" 
          : "border-border hover:border-brand hover:shadow-lg hover:-translate-y-1"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap gap-2 mb-2">
            {isFeatured && (
              <Badge variant="featured">
                Featured
              </Badge>
            )}
            {isVerified && (
              <Badge variant="verified">
                Verified
              </Badge>
            )}
            {isAggregated && (
              <Badge variant="default" className="bg-slate-100 text-slate-500 border-none">
                Aggregated
              </Badge>
            )}
            {matchScore && matchScore >= 50 && (
              <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-brand/10 text-brand">
                <Zap className="h-3 w-3 mr-1 fill-brand" />
                {matchScore}% Match
              </div>
            )}
          </div>
          <h3 className="text-lg font-black text-foreground group-hover:text-brand transition-colors leading-tight uppercase tracking-tightest">
            {title}
          </h3>
          <p className="text-sm font-bold text-muted-foreground">{employerName}</p>
        </div>
        <div className="rounded-full bg-muted p-2 text-muted-foreground group-hover:bg-brand/10 group-hover:text-brand transition-all">
          <ExternalLink className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-brand" />
          {location}
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-brand" />
          {new Date(createdAt).toLocaleDateString()}
        </div>
        {salaryRange && (
          <div className="flex items-center gap-1.5 font-black text-foreground bg-brand/10 px-2 py-1 rounded">
            {salaryRange}
          </div>
        )}
      </div>
    </Link>
  );
}