"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { JobCard } from "@/components/ui/job-card";

// Mock data fallback for when API is empty to ensure section density
const MOCK_JOBS = [
  {
    id: "mock-1",
    title: "Senior Software Engineer",
    profiles: { email: "tech@example.com" },
    location: "Sliema",
    salary_range: "€55,000 - €75,000",
    created_at: new Date().toISOString(),
    is_featured: true,
    employer_verified: true,
  },
  {
    id: "mock-2",
    title: "Head of Marketing",
    profiles: { email: "brand@example.com" },
    location: "St. Julians",
    salary_range: "€45,000 - €60,000",
    created_at: new Date().toISOString(),
    is_featured: true,
    employer_verified: true,
  },
  {
    id: "mock-3",
    title: "Product Designer",
    profiles: { email: "design@example.com" },
    location: "Remote",
    salary_range: "€40,000 - €55,000",
    created_at: new Date().toISOString(),
    is_featured: true,
    employer_verified: true,
  },
];

export default function FeaturedCarousel() {
  const [jobs, setJobs] = useState<any[]>(MOCK_JOBS.slice(0, 3)); // Start with mock data
  const [loading, setLoading] = useState(false); // Start as not loading

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      // Only fetch if component is still mounted
      if (!controller.signal.aborted) {
        fetch("/api/jobs/featured", { signal: controller.signal })
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
          })
          .then((payload) => {
            const data = payload.data ?? [];
            // Update with real data if available
            if (data.length > 0) {
              setJobs(data);
            }
          })
          .catch(() => {
            // Keep mock data on error
            console.log("Using mock data for featured jobs");
          });
      }
    }, 100); // Small delay to prioritize LCP

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <section className="w-full py-14 md:py-20 bg-white border-t">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 w-full skeleton rounded-3xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-14 md:py-20 bg-white border-t border-slate-50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-brand-accent font-black uppercase tracking-widest text-[10px] mb-4 bg-brand-accent/5 px-4 py-2 rounded-full border border-brand-accent/10">
              <Sparkles className="h-3.5 w-3.5 fill-brand-accent" />
              Premium Placement
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Featured Opportunities.
            </h2>
          </div>
          <Link
            href="/jobs"
            className="group flex items-center gap-2 text-sm font-bold text-primary hover:text-secondary transition-all"
            aria-label="View all active job listings in Malta"
          >
            View all active roles{" "}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {jobs.slice(0, 6).map((job) => (
            <JobCard
              key={job.id}
              id={job.id}
              title={job.title}
              employerName={job.profiles?.email?.split("@")[0] || "Verified Employer"}
              location={job.location || "Malta"}
              salaryRange={job.salary_range}
              createdAt={job.created_at}
              isFeatured={true}
              isVerified={job.employer_verified}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
