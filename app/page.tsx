import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(13,116,144,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(245,158,11,0.2),_transparent_45%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-20">
        <span className="w-fit rounded-full border border-teal-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 shadow-sm">
          Malta job alerts
        </span>
        <h1 className="font-display mt-6 text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl lg:text-6xl animate-fade-up">
          Careers Hive Malta - Fastest Job Alerts
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-700 sm:text-xl animate-fade-up-delayed">
          Get notified of new jobs in minutes, not hours
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button size="lg">Jobseeker Sign Up</Button>
          <Button variant="outline" size="lg">
            Employer Sign Up
          </Button>
        </div>
        <div className="mt-12 grid gap-6 text-sm text-slate-600 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <p className="font-semibold text-slate-900">Instant matching</p>
            <p className="mt-2">
              Alerts fire the moment a job hits the platform.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <p className="font-semibold text-slate-900">Role-based flows</p>
            <p className="mt-2">Hire faster or find roles tailored to you.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <p className="font-semibold text-slate-900">Built for Malta</p>
            <p className="mt-2">Local insights, salaries, and locations first.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
