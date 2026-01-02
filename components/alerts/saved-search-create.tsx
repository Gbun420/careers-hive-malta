"use client";

import { useRouter } from "next/navigation";
import SavedSearchForm from "@/components/alerts/saved-search-form";
import type { SavedSearchCreate } from "@/lib/alerts/criteria";

export default function SavedSearchCreate() {
  const router = useRouter();

  const handleSubmit = async (payload: SavedSearchCreate) => {
    const response = await fetch("/api/saved-searches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error?.message ?? "Unable to create alert.");
    }

    router.push("/jobseeker/alerts");
  };

  return (
    <SavedSearchForm submitLabel="Create search" onSubmit={handleSubmit} />
  );
}
