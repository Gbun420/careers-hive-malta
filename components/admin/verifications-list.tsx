"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { EmployerVerification, VerificationStatus } from "@/lib/trust/schema";

type ApiError = {
  error?: {
    code?: string;
    message?: string;
  };
};

export default function AdminVerificationsList() {
  const [items, setItems] = useState<EmployerVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [notesById, setNotesById] = useState<Record<string, string>>({});

  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/verifications", {
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => ({}))) as ApiError & {
        data?: EmployerVerification[];
      };

      if (!response.ok) {
        setError(payload);
        return;
      }

      setItems(payload.data ?? []);
    } catch (err) {
      setError({
        error: {
          message: "Unable to load verification requests.",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, []);

  const handleStatusChange = async (
    id: string,
    status: VerificationStatus
  ) => {
    setError(null);
    const response = await fetch(`/api/admin/verifications/${id}` , {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        notes: notesById[id] ?? "",
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as ApiError;

    if (!response.ok) {
      setError(payload);
      return;
    }

    await loadItems();
  };

  if (loading) {
    return <p className="text-sm text-slate-600">Loading requests...</p>;
  }

  if (error?.error?.code === "SUPABASE_NOT_CONFIGURED") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Connect Supabase to view verification requests. {" "}
        <Link href="/setup" className="underline">
          Go to setup
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

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
        <p className="text-sm text-slate-600">No verification requests yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Employer ID: {item.employer_id}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Status: {item.status} · Submitted {new Date(item.submitted_at).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={item.status !== "pending"}
                onClick={() => handleStatusChange(item.id, "approved")}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                disabled={item.status !== "pending"}
                onClick={() => handleStatusChange(item.id, "rejected")}
              >
                Reject
              </Button>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor={`notes-${item.id}`}>Admin notes</Label>
            <Textarea
              id={`notes-${item.id}`}
              value={notesById[item.id] ?? ""}
              onChange={(event) =>
                setNotesById((prev) => ({
                  ...prev,
                  [item.id]: event.target.value,
                }))
              }
              rows={3}
              placeholder="Optional notes for the employer."
            />
          </div>
        </div>
      ))}
    </div>
  );
}
