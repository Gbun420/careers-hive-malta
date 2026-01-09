import { requireAdminPage } from "@/lib/auth/requireAdmin";
import AdminSignOutButton from "@/components/admin/sign-out-button";
import DashboardStats from "@/components/admin/dashboard-stats";
import ReloadSchemaButton from "@/components/admin/reload-schema-button";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-12 px-6 py-16 animate-fade-up">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tightest text-slate-950 uppercase">
            Admin <span className="gradient-text">Command</span>.
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
              className={cn(
                "glass-card hover-lift rounded-2xl group border-border/40 p-6",
                link.className
              )}
            >
              <p className={cn(
                "text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors",
                link.badge ? "text-brand group-hover:text-brand-accent" : "text-slate-950 group-hover:text-brand"
              )}>
                {link.title}
                {link.badge && <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />}
              </p>
              <p className={cn(
                "mt-3 text-xs font-medium leading-relaxed",
                link.badge ? "text-brand/70" : "text-slate-500"
              )}>
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
        <div className="grid gap-6 sm:grid-cols-2">
          {userFlowPreviews.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="glass-card hover-lift rounded-[2rem] group border-dashed p-8"
            >
              <p className="text-[11px] font-black text-slate-950 group-hover:text-brand transition-colors uppercase tracking-widest">
                {link.title}
              </p>
              <p className="mt-3 text-sm font-medium text-slate-500 leading-relaxed">
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
