import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth/session";
import AdminReportsList from "@/components/admin/reports-list";
import AdminSignOutButton from "@/components/admin/sign-out-button";

export default function AdminReportsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Reports unavailable
        </h1>
        <p className="mt-3 text-slate-600">
          Connect Supabase to review job reports.
        </p>
        <Button asChild className="mt-6 w-fit">
          <Link href="/setup">Go to setup</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-slate-900">
            Job reports
          </h1>
          <p className="mt-2 text-slate-600">
            Review reports and resolve moderation actions.
          </p>
        </div>
        <AdminSignOutButton />
      </header>
      <AdminReportsList />
    </main>
  );
}
