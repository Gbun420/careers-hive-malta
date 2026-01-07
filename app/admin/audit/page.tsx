import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth/session";
import AdminAuditList from "@/components/admin/audit-list";
import AdminSignOutButton from "@/components/admin/sign-out-button";

export default function AdminAuditPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Audit logs unavailable
        </h1>
        <p className="mt-3 text-slate-600">
          Connect Supabase to view platform audit logs.
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
            Audit logs
          </h1>
          <p className="mt-2 text-slate-600">
            Track system changes and administrative actions.
          </p>
        </div>
        <AdminSignOutButton />
      </header>
      <AdminAuditList />
    </main>
  );
}
