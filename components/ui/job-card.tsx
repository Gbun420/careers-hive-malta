import Link from "next/link";
import { Badge } from "./badge";
import { MapPin, Calendar, ExternalLink, Zap, CheckCircle } from "lucide-react";
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
        "group relative flex flex-col gap-4 rounded-2xl border bg-card p-6 transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-1",
        isFeatured
          ? "border-brand/30 shadow-lg ring-1 ring-brand/10 bg-gradient-to-br from-white to-brand/5"
          : "border-border hover:border-brand/50"
      )}
    >
      {/* Featured Indicator */}
      {isFeatured && (
        <div className="absolute -top-px left-8 right-8 h-1 rounded-b-full bg-gradient-to-r from-brand to-brand-accent" />
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {isFeatured && (
              <Badge className="bg-gradient-to-r from-brand to-brand-light text-white border-none shadow-sm">
                ★ Featured
              </Badge>
            )}
            {isVerified && (
              <Badge className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Verified
              </Badge>
            )}
            {isAggregated && (
              <Badge variant="default" className="text-muted-foreground bg-muted">
                External
              </Badge>
            )}
            {matchScore && matchScore >= 50 && (
              <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-brand/10 text-brand">
                <Zap className="h-3 w-3 mr-1 fill-brand" />
                {matchScore}% Match
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-foreground group-hover:text-brand transition-colors leading-tight">
            {title}
          </h3>
          <p className="text-sm font-medium text-muted-foreground">{employerName}</p>
        </div>

        {/* Arrow Icon */}
        <div className="rounded-xl bg-muted/50 p-3 text-muted-foreground group-hover:bg-brand group-hover:text-white transition-all duration-300">
          <ExternalLink className="h-5 w-5" />
        </div>
      </div>

      {/* Meta Info */}
      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-brand" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-brand" />
          <span>{new Date(createdAt).toLocaleDateString()}</span>
        </div>
        {salaryRange && (
          <div className="ml-auto inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold text-foreground bg-green-50 border border-green-100">
            {salaryRange}
          </div>
        )}
      </div>
    </Link>
  );
}