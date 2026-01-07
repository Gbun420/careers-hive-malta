import { requireAdminPage } from "@/lib/auth/requireAdmin";
import AdminSignOutButton from "@/components/admin/sign-out-button";
import AdminVerificationsList from "@/components/admin/verifications-list";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { PageShell } from "@/components/ui/page-shell";

export default async function AdminVerificationsPage() {
  await requireAdminPage();

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <Badge variant="default" className="px-4 py-1 text-xs uppercase font-black tracking-widest text-brand-600 border-brand/20">Trust & Safety</Badge>
            <SectionHeading 
              title="Employer Verifications" 
              subtitle="Review and approve Maltese companies to unlock their verified badge."
            />
          </div>
          <AdminSignOutButton />
        </header>

        <AdminVerificationsList />
      </div>
    </PageShell>
  );
}