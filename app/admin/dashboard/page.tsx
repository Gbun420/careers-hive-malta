import { requireAdminPage } from "@/lib/auth/requireAdmin";
import AdminSignOutButton from "@/components/admin/sign-out-button";
import DashboardStats from "@/components/admin/dashboard-stats";
import ReloadSchemaButton from "@/components/admin/reload-schema-button";
import Link from "next/link";

export const dynamic = "force-dynamic";

type InternalHref = `/${string}`;

interface DashboardLink {
  title: string;
  description: string;
  href: InternalHref;
  className?: string;
  badge?: boolean;
}

export default async function AdminDashboard() {
  await requireAdminPage();

  const coreOperations: DashboardLink[] = [
    {
      title: "Job reports",
      description: "Moderate platform content.",
      href: "/admin/reports",
    },
    {
      title: "Employer verifications",
      description: "Manage trust signals.",
      href: "/admin/employers/verifications",
    },
    {
      title: "Audit logs",
      description: "Track system state.",
      href: "/admin/audit-logs",
    },
    {
      title: "Account settings",
      description: "Profile configuration.",
      href: "/settings",
    },
    {
      title: "Launch Control",
      description: "Commercial readiness gate.",
      href: "/admin/ops",
      className: "border-brand/20 bg-brand/5 shadow-sm",
      badge: true,
    },
  ];

  const userFlowPreviews: DashboardLink[] = [
    {
      title: "Jobseeker View →",
      description: "Alert management and saved searches.",
      href: "/jobseeker/alerts",
    },
    {
      title: "Employer View →",
      description: "Job posting and verification flows.",
      href: "/employer/jobs",
    },
  ];

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
          {coreOperations.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`tech-card rounded-xl group ${link.className || ""}`}
            >
              <p className={`text-[11px] font-black uppercase tracking-widest flex items-center gap-2 ${
                link.badge ? "text-brand-700 group-hover:text-brand" : "text-slate-950 group-hover:text-brand-600"
              } transition-colors`}>
                {link.title}
                {link.badge && <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />}
              </p>
              <p className={`mt-3 text-xs font-medium ${link.badge ? "text-brand-600/80" : "text-slate-500"}`}>
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          User Flow Previews
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {userFlowPreviews.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="tech-card rounded-xl group border-dashed"
            >
              <p className="text-[11px] font-black text-slate-950 group-hover:text-brand-600 transition-colors uppercase tracking-widest">
                {link.title}
              </p>
              <p className="mt-3 text-xs font-medium text-slate-500">
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
