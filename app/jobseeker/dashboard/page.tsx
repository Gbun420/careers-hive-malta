import Link from "next/link";

export default function JobseekerDashboard() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-16">
      <header>
        <h1 className="text-4xl font-black tracking-tightest text-slate-950">
          JOBSEEKER COMMAND.
        </h1>
        <p className="mt-3 text-lg font-medium text-slate-500">
          Manage alert streams and optimize search results.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/jobseeker/alerts"
          className="tech-card rounded-xl group"
        >
          <p className="font-black text-slate-950 group-hover:text-brand-600 transition-colors uppercase tracking-widest text-xs">Alert preferences</p>
          <p className="mt-3 text-sm font-medium text-slate-500">
            Update saved searches and delivery settings.
          </p>
        </Link>
        <Link
          href="/jobs"
          className="tech-card rounded-xl group"
        >
          <p className="font-black text-slate-950 group-hover:text-brand-600 transition-colors uppercase tracking-widest text-xs">Browse jobs</p>
          <p className="mt-3 text-sm font-medium text-slate-500">
            Explore the latest verified roles.
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
