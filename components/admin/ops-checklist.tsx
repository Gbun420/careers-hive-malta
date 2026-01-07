"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Rocket, 
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

type OpsCheck = {
  id: string;
  key: string;
  category: string;
  title: string;
  description: string;
  status: 'PENDING' | 'PASS' | 'FAIL';
  notes: string;
  last_checked_at: string | null;
};

export default function OpsChecklist() {
  const [checks, setChecks] = useState<OpsCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  const loadChecks = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/ops");
      const payload = await res.json();
      const data = payload.data || [];
      setChecks(data);
      
      const notesMap: Record<string, string> = {};
      data.forEach((c: OpsCheck) => {
        notesMap[c.id] = c.notes || "";
      });
      setEditingNotes(notesMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChecks();
  }, [loadChecks]);

  const updateStatus = async (id: string, status: OpsCheck['status']) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/ops", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id, 
          status, 
          notes: editingNotes[id] 
        }),
      });
      if (res.ok) {
        const payload = await res.json();
        setChecks(prev => prev.map(c => c.id === id ? payload.data : c));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const categories = ["P0", "P1", "P2"];

  if (loading) {
    return (
      <div className="space-y-12">
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-[2rem]" />
          <Skeleton className="h-48 w-full rounded-[2rem]" />
        </div>
      </div>
    );
  }

  const p0PassCount = checks.filter(c => c.category === "P0" && c.status === "PASS").length;
  const p0Total = checks.filter(c => c.category === "P0").length;
  const isGo = p0PassCount === p0Total;

  return (
    <div className="space-y-16">
      <div className={`p-8 rounded-[2.5rem] border-2 flex flex-col md:flex-row items-center justify-between gap-8 transition-all ${
        isGo ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
      }`}>
        <div className="flex items-center gap-6">
          <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center shadow-sm ${
            isGo ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
          }`}>
            {isGo ? <Rocket className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${isGo ? "text-emerald-600" : "text-rose-600"}`}>
              Current Gate Status
            </p>
            <p className={`text-3xl font-black uppercase tracking-tightest ${isGo ? "text-emerald-900" : "text-rose-900"}`}>
              {isGo ? "GO FOR LAUNCH" : "NO-GO (P0 BLOCKED)"}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">P0 Progress</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-2 w-32 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${isGo ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{ width: `${(p0PassCount / p0Total) * 100}%` }}
              />
            </div>
            <p className="text-xs font-black text-slate-900">{p0PassCount}/{p0Total}</p>
          </div>
        </div>
      </div>

      <div className="space-y-20">
        {categories.map(cat => (
          <section key={cat} className="space-y-8">
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-lg ${
                cat === 'P0' ? 'bg-rose-900 text-white' : cat === 'P1' ? 'bg-amber-500 text-white' : 'bg-slate-400 text-white'
              }`}>
                {cat}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {cat === 'P0' ? 'Critical Baseline' : cat === 'P1' ? 'Operational Stability' : 'Safe Scaling'}
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {cat === 'P0' ? 'Must pass before any traffic' : cat === 'P1' ? 'Must resolve within 48h of launch' : 'Nice to have for growth'}
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              {checks.filter(c => c.category === cat).map(check => (
                <Card key={check.id} className={`rounded-[2rem] border-2 transition-all ${
                  check.status === 'PASS' ? 'border-emerald-100 bg-white shadow-sm' : 
                  check.status === 'FAIL' ? 'border-rose-100 bg-rose-50/30' : 'border-slate-100 bg-white'
                }`}>
                  <div className="p-8 flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        {check.status === 'PASS' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : 
                         check.status === 'FAIL' ? <XCircle className="h-5 w-5 text-rose-500" /> : 
                         <Clock className="h-5 w-5 text-slate-300" />}
                        <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{check.title}</h4>
                      </div>
                      <p className="text-sm font-medium text-slate-500 leading-relaxed italic">{check.description}</p>
                      
                      <div className="pt-2">
                        <Textarea 
                          placeholder="Add verification notes, test evidence, or failure details..."
                          value={editingNotes[check.id] || ""}
                          onChange={e => setEditingNotes(prev => ({ ...prev, [check.id]: e.target.value }))}
                          className="rounded-xl border-slate-100 text-xs font-medium focus:border-brand h-20 bg-slate-50/50"
                        />
                      </div>
                    </div>

                    <div className="lg:w-64 flex flex-col justify-between gap-6 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-8 pt-6 lg:pt-0">
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mark Result</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant={check.status === 'PASS' ? 'default' : 'outline'}
                            onClick={() => updateStatus(check.id, 'PASS')}
                            disabled={updatingId === check.id}
                            className={`rounded-xl h-10 font-black uppercase text-[10px] tracking-widest border-none ${
                              check.status === 'PASS' ? 'bg-emerald-500 text-white shadow-cta' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                            }`}
                          >
                            Pass
                          </Button>
                          <Button 
                            variant={check.status === 'FAIL' ? 'default' : 'outline'}
                            onClick={() => updateStatus(check.id, 'FAIL')}
                            disabled={updatingId === check.id}
                            className={`rounded-xl h-10 font-black uppercase text-[10px] tracking-widest border-none ${
                              check.status === 'FAIL' ? 'bg-rose-500 text-white shadow-cta' : 'bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                            }`}
                          >
                            Fail
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Verified</p>
                        <p className="text-xs font-bold text-slate-900">
                          {check.last_checked_at ? format(new Date(check.last_checked_at), "MMM d, HH:mm") : "Never"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
