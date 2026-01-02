import Link from "next/link";

export default function EmployerDashboard() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-16">
      <header>
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Employer dashboard
        </h1>
        <p className="mt-2 text-slate-600">
          Post roles, review applicants, and manage alerts.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/employer/jobs"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="font-semibold text-slate-900">Manage job posts</p>
          <p className="mt-2 text-sm text-slate-600">
            Create and track job listings.
          </p>
        </Link>
        <Link
          href="/jobs"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="font-semibold text-slate-900">Public listings</p>
          <p className="mt-2 text-sm text-slate-600">
            View what candidates see right now.
          </p>
        </Link>
        <Link
          href="/employer/verification"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="font-semibold text-slate-900">Verification</p>
          <p className="mt-2 text-sm text-slate-600">
            Request a verified employer badge.
          </p>
        </Link>
      </section>
    </main>
  );
}
