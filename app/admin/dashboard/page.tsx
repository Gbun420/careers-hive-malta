import Link from "next/link";
import AdminSignOutButton from "@/components/admin/sign-out-button";
import DashboardStats from "@/components/admin/dashboard-stats";

export default function AdminDashboard() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-slate-900">
            Admin dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            Moderate jobs and manage platform trust signals.
          </p>
        </div>
        <AdminSignOutButton />
      </header>
      
      <DashboardStats />

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/reports"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-500/30 hover:shadow-md"
        >
          <p className="font-semibold text-slate-900">Job reports</p>
          <p className="mt-2 text-sm text-slate-600">
            Review and resolve moderation actions.
          </p>
        </Link>
        <Link
          href="/admin/verifications"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-500/30 hover:shadow-md"
        >
          <p className="font-semibold text-slate-900">Employer verifications</p>
          <p className="mt-2 text-sm text-slate-600">
            Manage platform trust signals and badges.
          </p>
        </Link>
      </section>
    </main>
  );
}
