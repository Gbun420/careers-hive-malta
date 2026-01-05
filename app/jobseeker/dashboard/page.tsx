import Link from "next/link";

export default function JobseekerDashboard() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-16">
      <header>
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Jobseeker dashboard
        </h1>
        <p className="mt-2 text-slate-600">
          Manage alerts, saved searches, and new opportunities.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/jobseeker/alerts"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="font-semibold text-slate-900">Alert preferences</p>
          <p className="mt-2 text-sm text-slate-600">
            Update saved searches and delivery settings.
          </p>
        </Link>
        <Link
          href="/jobs"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="font-semibold text-slate-900">Browse jobs</p>
          <p className="mt-2 text-sm text-slate-600">
            Explore the latest verified roles.
          </p>
        </Link>
        <Link
          href="/settings"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-500/30"
        >
          <p className="font-semibold text-slate-900">Account settings</p>
          <p className="mt-2 text-sm text-slate-600">
            Update your profile and preferences.
          </p>
        </Link>
      </section>
    </main>
  );
}
