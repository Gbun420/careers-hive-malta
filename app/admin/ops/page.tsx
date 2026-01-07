import { requireAdminPage } from "@/lib/auth/requireAdmin";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import AdminSignOutButton from "@/components/admin/sign-out-button";
import OpsChecklist from "@/components/admin/ops-checklist";

export default async function AdminOpsPage() {
  await requireAdminPage();

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <Badge variant="default" className="px-4 py-1 text-xs uppercase font-black tracking-widest text-brand-600 border-brand/20 bg-brand/5">Commercial Readiness</Badge>
            <SectionHeading 
              title="Launch Control Panel" 
              subtitle="Verify commercial stability and safety before driving active traffic."
            />
          </div>
          <AdminSignOutButton />
        </header>

        <OpsChecklist />
      </div>
    </PageShell>
  );
}