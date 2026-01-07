import { requireAdminPage } from "@/lib/auth/requireAdmin";
import AdminSignOutButton from "@/components/admin/sign-out-button";
import DashboardStats from "@/components/admin/dashboard-stats";
import ReloadSchemaButton from "@/components/admin/reload-schema-button";
import Link from "next/link";

export default async function AdminDashboard() {
  await requireAdminPage();

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-12 px-6 py-16">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tightest text-slate-950 uppercase">
            Admin command.
          </h1>
          <p className="mt-3 text-lg font-medium text-slate-500">
            Global system monitoring and moderation.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ReloadSchemaButton />
          <AdminSignOutButton />
        </div>
      </header>
      
      <DashboardStats />

      <section className="space-y-6">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          Core Operations
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/reports"
            className="tech-card rounded-xl group"
          >
            <p className="text-[11px] font-black text-slate-950 group-hover:text-brand-600 transition-colors uppercase tracking-widest">Job reports</p>
            <p className="mt-3 text-xs font-medium text-slate-500">
              Moderate platform content.
            </p>
          </Link>
          <Link
            href="/admin/employers/verifications"
            className="tech-card rounded-xl group"
          >
            <p className="text-[11px] font-black text-slate-950 group-hover:text-brand-600 transition-colors uppercase tracking-widest">Employer verifications</p>
            <p className="mt-3 text-xs font-medium text-slate-500">
              Manage trust signals.
            </p>
          </Link>
          <Link
            href="/admin/audit-logs"
            className="tech-card rounded-xl group"
          >
            <p className="text-[11px] font-black text-slate-950 group-hover:text-brand-600 transition-colors uppercase tracking-widest">Audit logs</p>
            <p className="mt-3 text-xs font-medium text-slate-500">
              Track system state.
            </p>
          </Link>
          <Link
            href="/admin/ops"
            className="tech-card rounded-xl group border-brand/20 bg-brand/5 shadow-sm"
          >
            <p className="text-[11px] font-black text-brand-700 group-hover:text-brand transition-colors uppercase tracking-widest flex items-center gap-2">
              Launch Control
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
            </p>
            <p className="mt-3 text-xs font-medium text-brand-600/80">
              Commercial readiness gate.
            </p>
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          User Flow Previews
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/jobseeker/alerts"
            className="tech-card rounded-xl group border-dashed"
          >
            <p className="text-[11px] font-black text-slate-950 group-hover:text-brand-600 transition-colors uppercase tracking-widest">
              Jobseeker View →
            </p>
            <p className="mt-3 text-xs font-medium text-slate-500">
              Alert management and saved searches.
            </p>
          </Link>
          <Link
            href="/employer/jobs"
            className="tech-card rounded-xl group border-dashed"
          >
            <p className="text-[11px] font-black text-slate-950 group-hover:text-brand-600 transition-colors uppercase tracking-widest">
              Employer View →
            </p>
            <p className="mt-3 text-xs font-medium text-slate-500">
              Job posting and verification flows.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}