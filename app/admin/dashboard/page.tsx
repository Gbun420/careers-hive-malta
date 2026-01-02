import Link from "next/link";

export default function AdminDashboard() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-16">
      <header>
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Admin dashboard
        </h1>
        <p className="mt-2 text-slate-600">
          Moderate jobs and manage platform trust signals.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/jobs"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="font-semibold text-slate-900">Review job posts</p>
          <p className="mt-2 text-sm text-slate-600">
            Approve or reject pending listings.
          </p>
        </Link>
        <Link
          href="/admin/users"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="font-semibold text-slate-900">Manage users</p>
          <p className="mt-2 text-sm text-slate-600">
            Audit roles and deactivate accounts.
          </p>
        </Link>
      </section>
    </main>
  );
}
