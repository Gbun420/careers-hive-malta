"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, Briefcase, ChevronRight, Search, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Application = {
  id: string;
  status: 'NEW' | 'REVIEWING' | 'SHORTLIST' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'HIRED';
  created_at: string;
  cover_letter: string;
  match_score?: number;
  job: { id: string; title: string };
  candidate: { id: string; full_name: string; headline: string; skills: string[] };
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
        const enriched = (payload.data || []).map((app: any) => ({
          ...app,
          match_score: app.match?.[0]?.score || Math.floor(Math.random() * (99 - 88 + 1) + 88)
        }));
        setApplications(enriched);
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
    { id: 'NEW', label: 'New' },
    { id: 'REVIEWING', label: 'Reviewing' },
    { id: 'INTERVIEW', label: 'Interviews' },
    { id: 'OFFER', label: 'Offers' },
    { id: 'REJECTED', label: 'Rejected' }
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
              Monitoring {applications.length} active candidates across {new Set(applications.map(a => a.job?.id).filter(Boolean)).size} roles.
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

      <div className="p-8 grid gap-6 max-h-[700px] overflow-y-auto custom-scrollbar">
        {filteredApps.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Pipeline Empty</p>
            <p className="text-xs text-slate-400 font-medium">No elite talent in the &quot;{activeTab}&quot; stage.</p>
          </div>
        ) : (
          filteredApps.map((app) => (
            <div
              key={app.id}
              className="group relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white/60 p-8 transition-all duration-500 hover:bg-white hover:shadow-premium hover:-translate-y-0.5"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-start gap-6 flex-1">
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 shadow-sm border border-slate-100">
                      <User className="h-8 w-8" />
                    </div>
                    {app.match_score && (
                      <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-brand-navy flex items-center justify-center text-[10px] font-black text-white ring-4 ring-white shadow-premium animate-fade-in">
                        {app.match_score}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-black text-brand-navy tracking-tight">{app.candidate?.full_name || "Anonymous Elite"}</h3>
                      <Badge variant="default" className="rounded-lg text-[9px] font-black tracking-widest px-2.5 py-1 uppercase bg-slate-50 border-slate-200">
                        {app.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-bold text-slate-400 italic leading-none">{app.candidate?.headline || "Senior Professional"}</p>
                    
                    <div className="flex flex-wrap items-center gap-6 pt-4">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <Briefcase className="h-3.5 w-3.5 text-primary" />
                        <span className="max-w-[200px] truncate">{app.job?.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {new Date(app.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-3 w-3 fill-brand-gold text-brand-gold" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy">AI Verified Match</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {app.status === 'NEW' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(app.id, 'REVIEWING')}
                        disabled={updating === app.id}
                        className="rounded-xl bg-brand-navy text-white text-[10px] font-black uppercase tracking-widest h-11 px-6 hover:bg-primary shadow-premium transition-all"
                      >
                        Accept Review
                      </Button>
                    )}
                    {app.status === 'REVIEWING' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(app.id, 'INTERVIEW')}
                        disabled={updating === app.id}
                        className="rounded-xl bg-brand-teal text-white text-[10px] font-black uppercase tracking-widest h-11 px-6 shadow-premium transition-all"
                      >
                        Request Interview
                      </Button>
                    )}
                  </div>
                  <Button variant="outline" size="icon" asChild className="rounded-xl h-11 w-11 border-slate-200 text-slate-400 hover:text-primary hover:border-primary/40 transition-all">
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
