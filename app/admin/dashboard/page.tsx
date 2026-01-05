import Link from "next/link";
import AdminSignOutButton from "@/components/admin/sign-out-button";
import DashboardStats from "@/components/admin/dashboard-stats";
import ReloadSchemaButton from "@/components/admin/reload-schema-button";

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
        <div className="flex flex-wrap items-center gap-3">
          <ReloadSchemaButton />
          <AdminSignOutButton />
        </div>
      </header>
      
      <DashboardStats />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Platform Management
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
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
          <Link
            href="/admin/audit"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-500/30 hover:shadow-md"
          >
            <p className="font-semibold text-slate-900">Audit logs</p>
            <p className="mt-2 text-sm text-slate-600">
              Track system changes and administrative actions.
            </p>
          </Link>
          <Link
            href="/settings"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-500/30 hover:shadow-md"
          >
            <p className="font-semibold text-slate-900">Account settings</p>
            <p className="mt-2 text-sm text-slate-600">
              Update your administrative profile.
            </p>
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Portal Previews
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/jobseeker/dashboard"
            className="group rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-5 transition hover:border-teal-500/30 hover:bg-white"
          >
            <p className="font-semibold text-slate-900 group-hover:text-teal-600">
              Jobseeker View →
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Preview alert management and saved searches.
            </p>
          </Link>
          <Link
            href="/employer/dashboard"
            className="group rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-5 transition hover:border-teal-500/30 hover:bg-white"
          >
            <p className="font-semibold text-slate-900 group-hover:text-teal-600">
              Employer View →
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Preview job posting and verification flows.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
