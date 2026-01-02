import Link from "next/link";
import SavedSearchList from "@/components/alerts/saved-search-list";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth/session";

export default function JobseekerAlertsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
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
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-slate-900">
            Saved searches
          </h1>
          <p className="mt-2 text-slate-600">
            Create alerts for the roles you want to hear about first.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/jobseeker/alerts/new">Create search</Link>
        </Button>
      </header>
      <SavedSearchList />
    </main>
  );
}
