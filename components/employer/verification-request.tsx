"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, FileText, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import type { EmployerVerification } from "@/lib/trust/schema";

type ApiError = {
  error?: {
    code?: string;
    message?: string;
  };
};

export default function VerificationRequest() {
  const [verification, setVerification] = useState<EmployerVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadVerification = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/employer/verification/request", { cache: "no-store" });
      const payload = await response.json();
      if (response.ok) setVerification(payload.data ?? null);
    } catch (err) {
      setError({ error: { message: "Unable to load verification status." } });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadVerification();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/employer/verification/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const payload = await response.json();
      if (response.ok) {
        setVerification(payload.data ?? null);
        setSuccessMessage("Review request submitted successfully.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="h-48 w-full animate-pulse rounded-[2rem] bg-slate-100" />;

  const status = verification?.status;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-navy-100 bg-white p-8 shadow-premium">
          <div className="flex items-center justify-between mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-50 text-navy-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            {status ? (
              <Badge variant={status === 'approved' ? 'verified' : 'new'}>
                {status.toUpperCase()}
              </Badge>
            ) : (
              <Badge>UNVERIFIED</Badge>
            )}
          </div>

          <h3 className="text-xl font-black text-navy-950">Verification Status</h3>
          <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed">
            {status === "approved" 
              ? "Your company is verified. Your jobs now feature the priority trust badge."
              : status === "pending"
              ? "Your request is being reviewed by our compliance team. Expected time: 1-2 business days."
              : "Verify your business to increase candidate trust and unlock premium features."}
          </p>

          {status === "approved" && (
            <div className="mt-8 flex items-center gap-2 text-secondary font-bold text-xs uppercase tracking-widest bg-secondary/10 p-4 rounded-xl">
              <CheckCircle2 className="h-4 w-4" /> Priority Trust Badge Active
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-navy-100 bg-navy-950 p-8 text-white">
          <h4 className="text-sm font-black uppercase tracking-widest text-navy-400">Why verify?</h4>
          <ul className="mt-6 space-y-4">
            {[
              "3x higher candidate application rate",
              "Exclusive 'Verified' badge on all listings",
              "Priority placement in industry feed",
              "Direct access to premium talent matching"
            ].map(item => (
              <li key={item} className="flex items-center gap-3 text-xs font-bold uppercase tracking-tight">
                <div className="h-1.5 w-1.5 rounded-full bg-coral-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-50 text-coral-600">
            <FileText className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-navy-950">Submit Documentation</h3>
        </div>

        {successMessage && (
          <p className="mb-6 rounded-xl bg-secondary/10 p-4 text-sm font-bold text-secondary border border-emerald-100">
            {successMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="notes" className="font-black text-[10px] uppercase tracking-widest text-navy-400">Business Details (VAT/ID/Website)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide your Maltese VAT number or company registration details for manual review."
              className="min-h-[150px] rounded-2xl border-slate-200 focus:border-navy-400"
              required
              disabled={status === "pending" || status === "approved"}
            />
          </div>
          
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-navy-400 mt-0.5" />
            <p className="text-[10px] font-medium text-slate-500 leading-normal">
              Manual review ensures 100% legitimate opportunities on Careers.mt. Our team will verify your entity against Maltese business registries.
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-navy-950 hover:bg-navy-800 text-white rounded-2xl h-14 font-black"
            disabled={submitting || status === "pending" || status === "approved"}
          >
            {status === "pending" ? "Review in Progress..." : status === "approved" ? "Company Verified" : "Request Manual Review"}
          </Button>
        </form>
      </div>
    </div>
  );
}