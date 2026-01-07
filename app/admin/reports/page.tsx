import { requireAdminPage } from "@/lib/auth/requireAdmin";
import AdminSignOutButton from "@/components/admin/sign-out-button";
import AdminReportsList from "@/components/admin/reports-list";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { PageShell } from "@/components/ui/page-shell";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  await requireAdminPage();

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <Badge variant="default" className="px-4 py-1 text-xs uppercase font-black tracking-widest text-rose-600 border-rose-200 bg-rose-50">Moderation</Badge>
            <SectionHeading 
              title="Job Reports" 
              subtitle="Review flagged content and take action to maintain platform quality."
            />
          </div>
          <AdminSignOutButton />
        </header>

        <AdminReportsList />
      </div>
    </PageShell>
  );
}