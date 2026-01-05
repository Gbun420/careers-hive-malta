"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { JobCard } from "@/components/ui/job-card";
import { Search, MapPin, Filter, X, Euro, ShieldCheck, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { JobsListSkeleton } from "@/components/ui/skeleton";

interface PublicJobsListProps {
  initialData?: any[];
  initialMeta?: {
    total: number;
    page: number;
    limit: number;
    has_more: boolean;
  };
}

export default function PublicJobsList({ initialData = [], initialMeta }: PublicJobsListProps) {
  const [jobs, setJobs] = useState<any[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Basic Search
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  
  // Advanced Filters
  const [showFilters, setShowFilters] = useState(false);
  const [salaryMin, setSalaryMin] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  
  const [page, setPage] = useState(initialMeta?.page || 1);
  const [hasMore, setHasMore] = useState(initialMeta?.has_more ?? false);
  const [total, setTotal] = useState(initialMeta?.total || 0);

  const firstRender = useRef(true);

  const loadJobs = useCallback(async (pageNum: number, isInitial: boolean) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query.trim().length > 0) params.set("q", query.trim());
      if (location.trim().length > 0) params.set("location", location.trim());
      if (salaryMin) params.set("salary_min", salaryMin);
      if (verifiedOnly) params.set("verified_only", "true");
      
      params.set("is_active", "true");
      params.set("page", pageNum.toString());
      params.set("limit", "20");

      const response = await fetch(`/api/jobs?${params.toString()}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error?.message || "Failed to load jobs");
      }

      const newJobs = payload.data ?? [];
      setJobs((prev) => (isInitial ? newJobs : [...prev, ...newJobs]));
      setHasMore(payload.meta?.has_more ?? false);
      setTotal(payload.meta?.total || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [query, location, salaryMin, verifiedOnly]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      setPage(1);
      void loadJobs(1, true);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, location, salaryMin, verifiedOnly, loadJobs]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    void loadJobs(nextPage, false);
  };

  const clearFilters = () => {
    setQuery("");
    setLocation("");
    setSalaryMin("");
    setVerifiedOnly(false);
  };

  return (
    <div className="space-y-10">
      {/* Search & Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search roles (e.g. Developer, Designer)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-100 bg-white py-4 pl-12 pr-4 text-sm font-bold text-slate-950 shadow-sm focus:border-brand-primary focus:outline-none transition-all"
            />
          </div>
          <div className="relative sm:w-1/3">
            <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Location (e.g. Valletta)"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-100 bg-white py-4 pl-12 pr-4 text-sm font-bold text-slate-950 shadow-sm focus:border-brand-primary focus:outline-none transition-all"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className={`rounded-2xl h-[58px] px-6 gap-2 border-2 ${showFilters ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-100'}`}
          >
            <Filter className="h-4 w-4" />
            <span className="font-bold">Filters</span>
          </Button>
        </div>

        {showFilters && (
          <div className="rounded-3xl border-2 border-slate-100 bg-white p-6 animate-fade-in shadow-sm">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Minimum Salary (EUR)</label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="number"
                    placeholder="e.g. 35000"
                    value={salaryMin}
                    onChange={e => setSalaryMin(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-50 bg-slate-50 py-2.5 pl-10 pr-3 text-sm font-bold focus:border-brand-primary focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Trust Gating</label>
                <button 
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 py-2 px-4 transition-all ${
                    verifiedOnly ? 'bg-brand-primary border-brand-primary text-white' : 'bg-slate-50 border-slate-50 text-slate-600 hover:border-slate-200'
                  }`}
                >
                  <ShieldCheck className={`h-5 w-5 ${verifiedOnly ? 'text-white' : 'text-slate-400'}`} />
                  <span className="text-sm font-bold tracking-tight">Verified Employers Only</span>
                </button>
              </div>

              <div className="flex items-end justify-end">
                <button onClick={clearFilters} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors flex items-center gap-2 mb-2">
                  <X className="h-3 w-3" /> Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Indicators */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-black uppercase tracking-widest text-slate-400">
            {loading ? "Syncing..." : `${total} Opportunities Found`}
          </span>
          {(query || location || salaryMin || verifiedOnly) && !loading && (
            <Badge variant="new" className="bg-brand-primary/10 text-brand-primary border-none">Filtered View</Badge>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {error ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-rose-100 bg-rose-50/50 p-8 text-center animate-fade-in">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-100 text-rose-600 mb-6">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-950 mb-2">Error</h3>
            <p className="text-slate-500 font-medium max-w-sm mb-8">{error}</p>
            <Button onClick={() => loadJobs(1, true)} variant="default" className="rounded-xl bg-slate-950 text-white">
              Retry
            </Button>
          </div>
        ) : loading ? (
          <JobsListSkeleton />
        ) : jobs.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 text-center animate-fade-in">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-400 mb-6">
              <Briefcase className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-950 mb-2">No matching roles</h3>
            <p className="text-slate-500 font-medium max-w-sm mb-8">Try adjusting your filters or search terms to explore more careers in Malta.</p>
            <Button onClick={clearFilters} variant="outline" className="rounded-xl">
              Reset Search
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title}
                employerName={job.profiles?.email?.split('@')[0] || "Verified Employer"}
                location={job.location || "Malta"}
                salaryRange={job.salary_range || (job.salary_min ? `€${job.salary_min.toLocaleString()} - €${job.salary_max?.toLocaleString()}` : undefined)}
                createdAt={job.created_at}
                isFeatured={job.is_featured}
                isVerified={job.employer_verified}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {hasMore && !loading && (
        <div className="mt-16 flex justify-center pb-20">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
            size="lg"
            className="w-full sm:w-auto min-w-[280px] rounded-2xl font-black uppercase tracking-widest text-xs border-2 border-slate-100 hover:bg-slate-50 h-16"
          >
            {loadingMore ? "Loading more..." : "Explore More Jobs"}
          </Button>
        </div>
      )}
    </div>
  );
}