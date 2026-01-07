import { requireAdminPage } from "@/lib/auth/requireAdmin";
import AdminSignOutButton from "@/components/admin/sign-out-button";
import AdminAuditList from "@/components/admin/audit-list";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { PageShell } from "@/components/ui/page-shell";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  await requireAdminPage();

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <Badge variant="default" className="px-4 py-1 text-xs uppercase font-black tracking-widest text-slate-600 border-slate-200">System Logs</Badge>
            <SectionHeading 
              title="Platform Audit Trail" 
              subtitle="Comprehensive log of all administrative actions and critical system changes."
            />
          </div>
          <AdminSignOutButton />
        </header>

        <AdminAuditList />
      </div>
    </PageShell>
  );
}