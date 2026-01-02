import Link from "next/link";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth/session";
import { getUserRole } from "@/lib/auth/roles";

export default async function NotificationsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Notifications unavailable
        </h1>
        <p className="mt-3 text-slate-600">
          Connect Supabase to view alert notifications.
        </p>
        <Button asChild className="mt-6 w-fit">
          <Link href="/setup">Go to setup</Link>
        </Button>
      </main>
    );
  }

  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Notifications unavailable
        </h1>
        <p className="mt-3 text-slate-600">
          Supabase is not configured.
        </p>
      </main>
    );
  }

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Sign in required
        </h1>
        <p className="mt-3 text-slate-600">
          Log in to view your notifications.
        </p>
        <Button asChild className="mt-6 w-fit">
          <Link href="/login">Go to login</Link>
        </Button>
      </main>
    );
  }

  const role = getUserRole(authData.user);
  if (role !== "jobseeker") {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Notifications unavailable
        </h1>
        <p className="mt-3 text-slate-600">
          Notifications are only available for jobseekers.
        </p>
      </main>
    );
  }

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("id, status, channel, error, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Notifications unavailable
        </h1>
        <p className="mt-3 text-slate-600">{error.message}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-16">
      <header>
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Notifications
        </h1>
        <p className="mt-2 text-slate-600">
          Recent alert deliveries and statuses.
        </p>
      </header>
      {notifications && notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">
                {notification.channel} · {notification.status}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {new Date(notification.created_at).toLocaleString()}
              </p>
              {notification.error ? (
                <p className="mt-2 text-xs text-rose-600">
                  {notification.error}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
          <p className="text-sm text-slate-600">
            No notifications yet. Alerts will appear after matching jobs are posted.
          </p>
        </div>
      )}
    </main>
  );
}
