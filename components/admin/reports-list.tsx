"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  AlertOctagon, 
  CheckCircle2, 
  XCircle, 
  Trash2,
  ExternalLink,
  Loader2,
  Clock,
  ShieldAlert,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import Link from "next/link";

type JobReport = {
  id: string;
  job_id: string;
  reason: string;
  details: string;
  status: 'new' | 'reviewing' | 'resolved' | 'dismissed';
  created_at: string;
  job: {
    id: string;
    title: string;
    employer: {
      id: string;
      full_name: string;
      headline: string;
    }
  }
};

export default function AdminReportsList() {
  const [reports, setReports] = useState<JobReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [activeStatus, setActiveStatus] = useState("new");

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?status=${activeStatus}`);
      const payload = await res.json();
      setReports(payload.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeStatus]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleAction = async (id: string, action: 'RESOLVE' | 'DISMISS' | 'TAKEDOWN') => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action, 
          notes: notes[id] 
        }),
      });
      if (res.ok) {
        setReports(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <Tabs defaultValue="new" onValueChange={setActiveStatus} className="w-full">
        <TabsList className="bg-slate-100/50 p-1 rounded-2xl h-14 w-full sm:w-auto">
          <TabsTrigger value="new" className="rounded-xl px-8 h-12 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">New</TabsTrigger>
          <TabsTrigger value="reviewing" className="rounded-xl px-8 h-12 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Reviewing</TabsTrigger>
          <TabsTrigger value="resolved" className="rounded-xl px-8 h-12 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Resolved</TabsTrigger>
          <TabsTrigger value="dismissed" className="rounded-xl px-8 h-12 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Dismissed</TabsTrigger>
        </TabsList>

        <div className="mt-8 space-y-6">
          {reports.length === 0 ? (
            <Card className="rounded-[2rem] border-dashed border-2 p-16 text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                <ShieldAlert className="h-6 w-6 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">All Clear</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">No {activeStatus} reports to display.</p>
            </Card>
          ) : (
            reports.map(report => (
              <Card key={report.id} className="rounded-[2rem] border-2 border-slate-100 overflow-hidden group">
                <div className="p-8 flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                          <AlertOctagon className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                            {report.reason}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <Clock className="h-3 w-3" />
                            Reported {format(new Date(report.created_at), "MMM d, HH:mm")}
                          </div>
                        </div>
                      </div>
                      <Badge variant={report.status === 'new' ? 'error' : 'default'} className="rounded-full uppercase text-[9px] font-black tracking-widest px-3 py-1">
                        {report.status}
                      </Badge>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Reporter Details</p>
                      <p className="text-sm font-medium text-slate-700 italic leading-relaxed">
                        &quot;{report.details || "No additional details provided."}&quot;
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border-2 border-slate-50">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Job</p>
                        <p className="text-sm font-black text-slate-900">{report.job?.title}</p>
                        <p className="text-xs font-bold text-brand-600 uppercase tracking-widest">{report.job?.employer?.full_name}</p>
                      </div>
                      <Link 
                        href={`/job/${report.job_id}`}
                        className="h-10 px-4 rounded-xl border border-slate-200 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        View Job <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resolution Notes</p>
                      <Textarea 
                        placeholder="Explain the action taken..."
                        value={notes[report.id] || ""}
                        onChange={e => setNotes(prev => ({ ...prev, [report.id]: e.target.value }))}
                        className="rounded-xl border-slate-100 text-xs font-medium focus:border-brand bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="lg:w-64 flex flex-col gap-3 pt-6 lg:pt-0 lg:border-l border-slate-100 lg:pl-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Actions</p>
                    <Button 
                      onClick={() => handleAction(report.id, 'RESOLVE')}
                      disabled={updatingId === report.id}
                      className="w-full rounded-xl h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest border-none shadow-cta transition-all"
                    >
                      Resolve Only
                    </Button>
                    <Button 
                      onClick={() => handleAction(report.id, 'TAKEDOWN')}
                      disabled={updatingId === report.id}
                      className="w-full rounded-xl h-12 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-[10px] tracking-widest border-none shadow-cta transition-all flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Takedown Job
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleAction(report.id, 'DISMISS')}
                      disabled={updatingId === report.id}
                      className="w-full rounded-xl h-12 border-slate-100 hover:border-slate-300 text-slate-400 font-black uppercase text-[10px] tracking-widest transition-all"
                    >
                      Dismiss Report
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Tabs>
    </div>
  );
}