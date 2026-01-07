"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AuditLogEntry } from "@/lib/trust/schema";

type ApiError = {
  error?: {
    code?: string;
    message?: string;
  };
};

export default function AdminAuditList() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/audit", {
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => ({}))) as ApiError & {
        data?: AuditLogEntry[];
      };

      if (!response.ok) {
        setError(payload);
        return;
      }

      setLogs(payload.data ?? []);
    } catch (err) {
      setError({
        error: {
          message: "Unable to load audit logs.",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLogs();
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-600">Loading audit logs...</p>;
  }

  if (error?.error?.message) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error.error.message}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
        <p className="text-sm text-slate-600">No audit logs found yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div
          key={log.id}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900 capitalize">
                {log.action.replace(/_/g, " ")}
              </p>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {new Date(log.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Entity: <span className="font-mono">{log.entity_type}</span> ({log.entity_id})
            </p>
            {log.meta && Object.keys(log.meta).length > 0 && (
              <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-50 p-3 text-[10px] text-slate-700">
                {JSON.stringify(log.meta, null, 2)}
              </pre>
            )}
            <p className="mt-1 text-[10px] text-slate-400">
              Actor ID: {log.actor_id || "System"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
