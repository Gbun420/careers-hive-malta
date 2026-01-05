import Link from "next/link";

export default function EmployerDashboard() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-16">
      <header>
        <h1 className="text-4xl font-black tracking-tightest text-slate-950">
          EMPLOYER COMMAND.
        </h1>
        <p className="mt-3 text-lg font-medium text-slate-500">
          Manage listings and optimize Maltese recruitment speed.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/employer/jobs"
          className="tech-card rounded-xl group"
        >
          <p className="font-black text-slate-950 group-hover:text-brand-600 transition-colors uppercase tracking-widest text-xs">Manage job posts</p>
          <p className="mt-3 text-sm font-medium text-slate-500">
            Create and track job listings.
          </p>
        </Link>
        <Link
          href="/jobs"
          className="tech-card rounded-xl group"
        >
          <p className="font-black text-slate-950 group-hover:text-brand-600 transition-colors uppercase tracking-widest text-xs">Public listings</p>
          <p className="mt-3 text-sm font-medium text-slate-500">
            View what candidates see right now.
          </p>
        </Link>
        <Link
          href="/employer/verification"
          className="tech-card rounded-xl group"
        >
          <p className="font-black text-slate-950 group-hover:text-brand-600 transition-colors uppercase tracking-widest text-xs">Verification</p>
          <p className="mt-3 text-sm font-medium text-slate-500">
            Request a verified employer badge.
          </p>
        </Link>
        <Link
          href="/settings"
          className="tech-card rounded-xl group"
        >
          <p className="font-black text-slate-950 group-hover:text-brand-600 transition-colors uppercase tracking-widest text-xs">Account settings</p>
          <p className="mt-3 text-sm font-medium text-slate-500">
            Update your profile and preferences.
          </p>
        </Link>
      </section>
    </main>
  );
}
