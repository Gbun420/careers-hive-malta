"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  ExternalLink,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { SafeExternalLink } from "@/components/common/SafeExternalLink";

type PendingEmployer = {
  id: string;
  full_name: string;
  headline: string;
  created_at: string;
};

export default function AdminVerificationsList() {
  const [employers, setEmployers] = useState<PendingEmployer[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const loadPending = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/employers/pending");
      const payload = await res.json();
      setEmployers(payload.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const handleVerify = async (id: string, decision: 'APPROVE' | 'REJECT') => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/employers/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          decision, 
          notes: notes[id] 
        }),
      });
      if (res.ok) {
        setEmployers(prev => prev.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (employers.length === 0) {
    return (
      <Card className="rounded-[2rem] border-dashed border-2 p-12 text-center">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-6 w-6 text-slate-300" />
        </div>
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Queue Clear</h3>
        <p className="text-sm font-medium text-slate-500 mt-1">No pending employer verifications at this time.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          Pending Review ({employers.length})
        </h3>
      </div>

      <div className="grid gap-6">
        {employers.map(employer => (
          <Card key={employer.id} className="rounded-[2rem] border-2 border-slate-100 hover:border-brand/10 transition-all overflow-hidden group">
            <div className="p-8 flex flex-col lg:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-brand/5 flex items-center justify-center text-brand-600 group-hover:bg-brand group-hover:text-white transition-colors">
                    <Building2 className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{employer.full_name}</h4>
                    <p className="text-sm font-bold text-brand-600 uppercase tracking-widest mt-0.5">{employer.headline}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Clock className="h-3 w-3" />
                      Joined {format(new Date(employer.created_at), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Review Notes</p>
                  <Textarea 
                    placeholder="Add notes about your verification check (e.g. checked MFSA, LinkedIn, etc.)"
                    value={notes[employer.id] || ""}
                    onChange={e => setNotes(prev => ({ ...prev, [employer.id]: e.target.value }))}
                    className="rounded-xl border-slate-100 text-xs font-medium focus:border-brand bg-slate-50/50 min-h-[100px]"
                  />
                </div>
              </div>

              <div className="lg:w-72 flex flex-col justify-between gap-6 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-8 pt-6 lg:pt-0">
                <div className="space-y-4">
                  <Button 
                    onClick={() => handleVerify(employer.id, 'APPROVE')}
                    disabled={updatingId === employer.id}
                    className="w-full rounded-xl h-12 bg-secondary hover:bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest border-none shadow-cta transition-all"
                  >
                    {updatingId === employer.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve & Verify"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleVerify(employer.id, 'REJECT')}
                    disabled={updatingId === employer.id || !notes[employer.id]}
                    className="w-full rounded-xl h-12 border-slate-100 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 font-black uppercase text-[10px] tracking-widest transition-all"
                  >
                    Reject
                  </Button>
                  {!notes[employer.id] && (
                    <p className="text-[9px] font-bold text-rose-400 uppercase text-center leading-tight">
                      * Notes required for rejection
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Quick Links</p>
                  <div className="flex flex-col gap-1">
                    <SafeExternalLink href={`https://www.google.com/search?q=${encodeURIComponent(employer.full_name + ' Malta')}`} className="text-[10px] font-bold text-slate-600 hover:text-brand flex items-center gap-1">
                      Search Google <ExternalLink className="h-2 w-2" />
                    </SafeExternalLink>
                    <SafeExternalLink href={`https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(employer.full_name)}`} className="text-[10px] font-bold text-slate-600 hover:text-brand flex items-center gap-1">
                      Search LinkedIn <ExternalLink className="h-2 w-2" />
                    </SafeExternalLink>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}