import ProfileForm from "@/components/profile/profile-form";
import { isSupabaseConfigured } from "@/lib/auth/session";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <PageShell>
        <EmptyState 
          icon={Settings}
          title="Settings unavailable"
          description="Connect Supabase to manage your account settings."
          action={{
            label: "Go to setup",
            href: "/setup"
          }}
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <header className="mb-12">
        <SectionHeading 
          title="Account Settings" 
          subtitle="Manage your personal information and preferences."
        />
      </header>
      <ProfileForm />
    </PageShell>
  );
}