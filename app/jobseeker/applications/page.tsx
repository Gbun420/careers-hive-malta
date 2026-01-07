"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, MapPin, Calendar, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { getStatusMeta } from "@/lib/ui/applicationStatus";
import { trackEvent } from "@/lib/analytics";

type Application = {
  id: string;
  status: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    location: string;
    company_name: string;
  };
};

export default function JobseekerApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    trackEvent("jobseeker_applications_viewed" as any, {});
    const loadApps = async () => {
      try {
        const res = await fetch("/api/jobseeker/applications");
        const payload = await res.json();
        setApps(payload.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadApps();
  }, []);

  const filteredApps = apps.filter(app => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return !["REJECTED", "HIRED"].includes(app.status);
    if (filter === "REJECTED") return app.status === "REJECTED";
    return true;
  });

  if (loading) {
    return (
      <PageShell>
        <div className="max-w-5xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <SectionHeading 
            title="Your Applications" 
            subtitle="Track your progress with Maltese employers in real-time."
          />
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {["ALL", "ACTIVE", "REJECTED"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  filter === f ? "bg-white text-brand shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredApps.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm text-slate-300">
              <Briefcase className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase">No applications found</h3>
            <p className="text-slate-500 mt-2 font-medium">You haven&apos;t applied for any roles in this category yet.</p>
            <Button asChild className="mt-8 rounded-xl bg-brand text-white border-none shadow-cta px-8">
              <Link href="/jobs" className="gap-2">
                <Search className="h-4 w-4" />
                Browse Malta Jobs
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredApps.map((app) => {
              const meta = getStatusMeta(app.status);
              return (
                <Card key={app.id} className="rounded-2xl border-slate-100 hover:border-brand/20 transition-all shadow-sm hover:shadow-md group">
                  <Link href={`/jobseeker/applications/${app.id}`} onClick={() => trackEvent('jobseeker_application_opened' as any, { applicationId: app.id })}>
                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-brand transition-colors">
                            {app.job.title}
                          </h3>
                          <Badge className={`${meta.bgColor} ${meta.color} border-none font-bold text-[10px] py-0 h-5`}>
                            {meta.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5 text-brand" /> {app.job.company_name}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-brand" /> {app.job.location}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-brand" /> {format(new Date(app.created_at), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-brand font-black uppercase text-[10px] tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
