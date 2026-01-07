"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NativeSelect as Select } from "@/components/ui/select";
import { reportReasons } from "@/lib/trust/schema";

type ApiError = {
  error?: {
    code?: string;
    message?: string;
  };
};

type ReportJobDialogProps = {
  jobId: string;
};

export default function ReportJobDialog({ jobId }: ReportJobDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<(typeof reportReasons)[number]>(
    reportReasons[0]
  );
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, details }),
      });
      const payload = (await response.json().catch(() => ({}))) as ApiError;

      if (!response.ok) {
        setError(payload);
        return;
      }

      setSuccess(true);
      setDetails("");
    } catch (submitError) {
      setError({
        error: {
          message: "Unable to submit report.",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Report job
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Report this job
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Tell us what looks suspicious or incorrect.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-slate-500"
              >
                Close
              </button>
            </div>

            {success ? (
              <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                Report submitted. Thanks for helping keep listings safe.
              </p>
            ) : null}

            {error?.error?.code === "SUPABASE_NOT_CONFIGURED" ? (
              <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
                Connect Supabase to submit reports. {" "}
                <Link href="/setup" className="underline">
                  Go to setup
                </Link>
                .
              </p>
            ) : null}

            {error?.error?.code === "UNAUTHORIZED" ? (
              <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
                Please sign in to report a job. {" "}
                <Link href="/login" className="underline">
                  Go to login
                </Link>
                .
              </p>
            ) : null}

            {error?.error?.message &&
            error.error.code !== "SUPABASE_NOT_CONFIGURED" &&
            error.error.code !== "UNAUTHORIZED" ? (
              <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
                {error.error.message}
              </p>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Select
                  id="reason"
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value as (typeof reportReasons)[number])
                  }
                  required
                >
                  {reportReasons.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="details">Details (optional)</Label>
                <Textarea
                  id="details"
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  placeholder="Add any extra context (max 500 characters)."
                  rows={4}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit report"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
