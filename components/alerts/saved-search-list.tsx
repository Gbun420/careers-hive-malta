"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { SavedSearch } from "@/lib/alerts/criteria";

export default function SavedSearchList() {
  const [items, setItems] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSearches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/saved-searches", {
        cache: "no-store",
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message = payload?.error?.message ?? "Unable to load alerts.";
        throw new Error(message);
      }
      const payload = await response.json();
      setItems(payload.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load alerts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSearches();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Delete this saved search? This cannot be undone."
    );
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/saved-searches/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error?.message ?? "Unable to delete alert.");
      return;
    }

    await loadSearches();
  };

  if (loading) {
    return <p className="text-sm text-slate-600">Loading saved searches...</p>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
        <p className="text-sm text-slate-600">
          No saved searches yet. Create one to get instant alerts.
        </p>
        <Button asChild className="mt-4">
          <Link href="/jobseeker/alerts/new">Create saved search</Link>
        </Button>
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
                {item.search_criteria.keywords || "Saved search"}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {item.frequency} · {item.search_criteria.location || "Any location"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href={`/jobseeker/alerts/${item.id}/edit`}>Edit</Link>
              </Button>
              <Button variant="outline" onClick={() => handleDelete(item.id)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
