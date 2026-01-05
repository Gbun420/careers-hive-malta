"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, Briefcase, Mail, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

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
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 w-full animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-[2.5rem] border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
          <User className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-navy-950">No applicants yet.</h3>
        <p className="mt-2 text-sm text-slate-500">Boost your listings to reach more Maltese talent.</p>
        <Button asChild variant="outline" className="mt-6 rounded-xl border-navy-200">
          <Link href="/employer/jobs">Promote Jobs</Link>
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
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-navy-400">
            Pipeline Activity ({applications.length})
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? "bg-navy-950 text-white shadow-lg shadow-navy-950/20" 
                  : "bg-white text-slate-400 border border-slate-200 hover:border-navy-200 hover:text-navy-950"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredApps.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-white/50">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No candidates in this stage</p>
          </div>
        ) : (
          filteredApps.map((app) => (
            <div 
              key={app.id} 
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-navy-200 hover:shadow-premium"
            >
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-black text-navy-950">{app.profiles?.full_name || "Maltese Talent"}</h3>
                      <Badge variant={app.status === 'pending' ? 'new' : 'verified'}>
                        {app.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs font-bold text-slate-500">{app.profiles?.headline}</p>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-navy-400">
                        <Briefcase className="h-3 w-3" />
                        {app.jobs.title}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-navy-400">
                        <Clock className="h-3 w-3" />
                        {new Date(app.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {app.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => updateStatus(app.id, 'reviewed')}
                        disabled={updating === app.id}
                        className="rounded-lg bg-navy-950 text-white text-[10px] font-black uppercase tracking-widest h-8"
                      >
                        Mark Reviewed
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateStatus(app.id, 'rejected')}
                        disabled={updating === app.id}
                        className="rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 text-[10px] font-black uppercase tracking-widest h-8"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {app.status === 'reviewed' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateStatus(app.id, 'interviewing')}
                      disabled={updating === app.id}
                      className="rounded-lg bg-coral-500 text-white text-[10px] font-black uppercase tracking-widest h-8"
                    >
                      Move to Interview
                    </Button>
                  )}
                  {app.status === 'interviewing' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateStatus(app.id, 'offered')}
                      disabled={updating === app.id}
                      className="rounded-lg bg-gold-500 text-white text-[10px] font-black uppercase tracking-widest h-8"
                    >
                      Make Offer
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="rounded-lg text-slate-400 hover:text-navy-950">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
