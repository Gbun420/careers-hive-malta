import Link from "next/link";
import SavedSearchCreate from "@/components/alerts/saved-search-create";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth/session";

export default function SavedSearchNewPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Alerts unavailable
        </h1>
        <p className="mt-3 text-slate-600">
          Connect Supabase to enable alerts and saved searches.
        </p>
        <Button asChild className="mt-6 w-fit">
          <Link href="/setup">Go to setup</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-16">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
          New alert
        </p>
        <h1 className="font-display mt-3 text-3xl font-semibold text-slate-900">
          Create a saved search
        </h1>
        <p className="mt-2 text-slate-600">
          We will alert you when new roles match your criteria.
        </p>
      </header>
      <SavedSearchCreate />
    </main>
  );
}
