"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SavedSearchForm from "@/components/alerts/saved-search-form";
import type { SavedSearch, SavedSearchCreate } from "@/lib/alerts/criteria";

type SavedSearchEditProps = {
  id: string;
};

type FormValues = {
  keywords: string;
  location: string;
  categories: string;
  employment_type: string;
  remote: boolean;
  salary_range: string;
  frequency: SavedSearchCreate["frequency"];
};

export default function SavedSearchEdit({ id }: SavedSearchEditProps) {
  const router = useRouter();
  const [initialValues, setInitialValues] = useState<FormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSearch = async () => {
      const response = await fetch(`/api/saved-searches/${id}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error?.message ?? "Unable to load saved search.");
        return;
      }
      const data: { data: SavedSearch } = await response.json();
      const search = data.data;
      setInitialValues({
        keywords: search.search_criteria.keywords ?? "",
        location: search.search_criteria.location ?? "",
        categories: (search.search_criteria.categories ?? []).join(", "),
        employment_type: search.search_criteria.employment_type ?? "",
        remote: search.search_criteria.remote ?? false,
        salary_range: search.search_criteria.salary_range ?? "",
        frequency: search.frequency,
      });
    };

    void loadSearch();
  }, [id]);

  const handleSubmit = async (payload: SavedSearchCreate) => {
    const response = await fetch(`/api/saved-searches/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error?.message ?? "Unable to update alert.");
    }

    router.push("/jobseeker/alerts");
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  if (!initialValues) {
    return <p className="text-sm text-slate-600">Loading saved search...</p>;
  }

  return (
    <SavedSearchForm
      initialValues={initialValues}
      submitLabel="Save changes"
      onSubmit={handleSubmit}
    />
  );
}
