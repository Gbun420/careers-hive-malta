import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth/session";
import ProfileForm from "@/components/profile/profile-form";
import SiteHeader from "@/components/nav/site-header";

export default function SettingsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Settings unavailable
        </h1>
        <p className="mt-3 text-slate-600">
          Connect Supabase to manage your account settings.
        </p>
        <Button asChild className="mt-6 w-fit">
          <Link href="/setup">Go to setup</Link>
        </Button>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <header>
          <h1 className="font-display text-3xl font-semibold text-slate-900">
            Account Settings
          </h1>
          <p className="mt-2 text-slate-600">
            Manage your personal information and preferences.
          </p>
        </header>
        <ProfileForm />
      </main>
    </div>
  );
}
