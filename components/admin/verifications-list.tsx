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

      const rawData = payload.data;
      if (!Array.isArray(rawData)) {
        setItems([]);
        return;
      }

      setItems(rawData);
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

  const pendingItems = items.filter((i) => i.status === "pending");
  const pastItems = items.filter((i) => i.status !== "pending");

  const VerificationCard = ({ item }: { item: EmployerVerification }) => (
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
            Status: <span className={`font-medium ${
              item.status === 'approved' ? 'text-emerald-600' : 
              item.status === 'rejected' ? 'text-rose-600' : 'text-amber-600'
            }`}>{item.status.toUpperCase()}</span> 
            {' · '} 
            Submitted {item.submitted_at ? new Date(item.submitted_at).toLocaleString() : "Unknown date"}
          </p>
          {item.notes ? (
              <p className="mt-2 text-xs italic text-slate-500">
                  User Note: {item.notes}
              </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {item.status === "pending" && (
            <>
              <Button
                variant="outline"
                className="hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                onClick={() => handleStatusChange(item.id, "approved")}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                className="hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                onClick={() => handleStatusChange(item.id, "rejected")}
              >
                Reject
              </Button>
            </>
          )}
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
          rows={2}
          placeholder="Reason for decision..."
          className="text-xs"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Pending Requests ({pendingItems.length})</h2>
        {pendingItems.length === 0 ? (
           <p className="text-sm text-slate-500 italic">No pending verifications.</p>
        ) : (
          <div className="space-y-4">
            {pendingItems.map(item => <VerificationCard key={item.id} item={item} />)}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Past Verifications</h2>
         {pastItems.length === 0 ? (
           <p className="text-sm text-slate-500 italic">No history available.</p>
        ) : (
          <div className="space-y-4 opacity-75">
            {pastItems.map(item => <VerificationCard key={item.id} item={item} />)}
          </div>
        )}
      </section>
    </div>
  );
}
