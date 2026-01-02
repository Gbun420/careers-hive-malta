import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth/session";
import AdminVerificationsList from "@/components/admin/verifications-list";

export default function AdminVerificationsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Verifications unavailable
        </h1>
        <p className="mt-3 text-slate-600">
          Connect Supabase to review employer verification requests.
        </p>
        <Button asChild className="mt-6 w-fit">
          <Link href="/setup">Go to setup</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16">
      <header>
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Employer verifications
        </h1>
        <p className="mt-2 text-slate-600">
          Approve or reject employer verification requests.
        </p>
      </header>
      <AdminVerificationsList />
    </main>
  );
}
