"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, Briefcase, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Application = {
  id: string;
  status: 'pending' | 'reviewed' | 'interviewing' | 'rejected' | 'offered';
  created_at: string;
  cover_letter: string;
  jobs: { id: string; title: string };
  profiles: { id: string; full_name: string; headline: string; skills: string[] };
};

export default function ApplicantTracker() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Application['status'] | 'all'>('all');

  const loadApplications = async () => {
    try {
      const response = await fetch("/api/employer/applications");
      if (response.ok) {
        const payload = await response.json();
        setApplications(payload.data || []);
      }
    } catch (err) {
      console.error("Failed to load applications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadApplications();
  }, []);

  const filteredApps = activeTab === 'all'
    ? applications
    : applications.filter(app => app.status === activeTab);

  const updateStatus = async (id: string, status: Application['status']) => {
    setUpdating(id);
    try {
      const response = await fetch(`/api/employer/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setApplications(prev => prev.map(app =>
          app.id === id ? { ...app, status } : app
        ));
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 w-full animate-pulse rounded-3xl bg-slate-100/50" />
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center gap-6">
        <div className="h-20 w-20 flex items-center justify-center rounded-full bg-slate-50 text-slate-300">
          <Search className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">No candidates yet.</h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Your active job listings are live and waiting for Maltese talent to discover them.
          </p>
        </div>
        <Button asChild variant="premium" className="rounded-xl px-8">
          <Link href="/employer/jobs/new">Post a Featured Job</Link>
        </Button>
      </div>
    );
  }

  const tabs: { id: Application['status'] | 'all', label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'New' },
    { id: 'reviewed', label: 'Reviewed' },
    { id: 'interviewing', label: 'Interviews' },
    { id: 'offered', label: 'Offers' },
    { id: 'rejected', label: 'Rejected' }
  ];

  return (
    <div className="flex flex-col h-full bg-white/30 backdrop-blur-xl">
      <div className="p-8 space-y-8 border-b border-border/40 bg-white/40">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-950 uppercase tracking-tightest">
              Applicant <span className="gradient-text">Pipeline</span>.
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Monitoring {applications.length} active candidates across {new Set(applications.map(a => a.jobs.id)).size} roles.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab.id
                  ? "bg-brand text-white shadow-lg shadow-brand/20"
                  : "bg-white/50 text-slate-500 border border-slate-200 hover:border-brand/40 hover:text-brand"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8 grid gap-4 max-h-[600px] overflow-y-auto custom-scrollbar">
        {filteredApps.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">Queue Empty</p>
            <p className="text-[10px] text-slate-400 font-medium">No candidates in the &quot;{activeTab}&quot; stage for now.</p>
          </div>
        ) : (
          filteredApps.map((app) => (
            <div
              key={app.id}
              className="group relative overflow-hidden rounded-3xl border border-border/40 bg-white/60 p-6 transition-all hover:bg-white hover:shadow-premium"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex gap-5">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-brand/5 text-brand">
                    <User className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-black text-slate-950 text-base">{app.profiles?.full_name || "Maltese Talent"}</h3>
                      <Badge variant={app.status === 'pending' ? 'new' : 'default'} className="rounded-lg text-[9px] font-black tracking-widest px-2.5 py-0.5">
                        {app.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs font-bold text-slate-400 italic">{app.profiles?.headline}</p>
                    <div className="flex items-center gap-6 pt-3">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <Briefcase className="h-3.5 w-3.5 text-brand" />
                        <span className="max-w-[150px] truncate">{app.jobs.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <Clock className="h-3.5 w-3.5 text-brand" />
                        {new Date(app.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden group-hover:flex items-center gap-2 animate-fade-in">
                    {app.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(app.id, 'reviewed')}
                        disabled={updating === app.id}
                        className="rounded-xl bg-slate-950 text-white text-[9px] font-black uppercase tracking-widest h-9 px-4 hover:bg-brand"
                      >
                        Accept
                      </Button>
                    )}
                    {app.status === 'reviewed' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(app.id, 'interviewing')}
                        disabled={updating === app.id}
                        className="rounded-xl bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest h-9 px-4"
                      >
                        Interview
                      </Button>
                    )}
                  </div>
                  <Button variant="outline" size="icon" asChild className="rounded-xl h-10 w-10 border-slate-200 text-slate-400 hover:text-brand hover:border-brand/40">
                    <Link href={`/employer/applications/${app.id}`}>
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
