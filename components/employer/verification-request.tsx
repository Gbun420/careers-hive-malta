"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { EmployerVerification } from "@/lib/trust/schema";

type ApiError = {
  error?: {
    code?: string;
    message?: string;
  };
};

export default function VerificationRequest() {
  const [verification, setVerification] = useState<EmployerVerification | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadVerification = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/employer/verification/request", {
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => ({}))) as ApiError & {
        data?: EmployerVerification | null;
      };

      if (!response.ok) {
        setError(payload);
        return;
      }

      setVerification(payload.data ?? null);
    } catch (err) {
      setError({
        error: {
          message: "Unable to load verification status.",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadVerification();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    setSubmitting(true);
    try {
      const response = await fetch("/api/employer/verification/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const payload = (await response.json().catch(() => ({}))) as ApiError & {
        data?: EmployerVerification;
      };

      if (!response.ok) {
        setError(payload);
        return;
      }

      setVerification(payload.data ?? null);
      setNotes("");
      setSuccessMessage("Verification request submitted.");
    } catch (submitError) {
      setError({
        error: {
          message: "Unable to submit verification request.",
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-600">Loading verification...</p>;
  }

  if (error?.error?.code === "SUPABASE_NOT_CONFIGURED") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Verification is unavailable. Connect Supabase to proceed. {" "}
        <Link href="/setup" className="underline">
          Go to setup
        </Link>
        .
      </div>
    );
  }

  if (error?.error?.code === "UNAUTHORIZED") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Sign in as an employer to request verification. {" "}
        <Link href="/login" className="underline">
          Go to login
        </Link>
        .
      </div>
    );
  }

  if (error?.error?.message) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error.error.message}
      </div>
    );
  }

  const status = verification?.status;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">Status</p>
        {status ? (
          <p className="mt-2 text-sm text-slate-600">
            {status === "approved"
              ? "Approved"
              : status === "pending"
              ? "Pending review"
              : "Rejected"}
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-600">
            No verification request submitted yet.
          </p>
        )}
        {verification?.notes ? (
          <p className="mt-2 text-xs text-slate-500">
            Notes: {verification.notes}
          </p>
        ) : null}
      </div>

      {successMessage ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notes">Supporting notes (optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add details about your company verification request."
            rows={4}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={submitting || status === "pending"}
        >
          {status === "pending"
            ? "Verification pending"
            : submitting
            ? "Submitting..."
            : "Request verification"}
        </Button>
      </form>
    </div>
  );
}
