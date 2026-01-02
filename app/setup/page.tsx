import Link from "next/link";
import { getMissingSupabaseEnv } from "@/lib/auth/session";

export default function SetupPage() {
  const missing = getMissingSupabaseEnv();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-slate-900">
        Supabase setup required
      </h1>
      <p className="mt-3 text-slate-600">
        Add the missing environment variables to <code>.env.local</code> and
        restart the dev server.
      </p>
      {missing.length > 0 ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
          <p className="font-semibold">Missing keys</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {missing.map((key) => (
              <li key={key}>{key}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900">
          <p className="font-semibold">Supabase is configured.</p>
          <p className="mt-2 text-sm">
            You can continue to {" "}
            <Link href="/login" className="underline">
              login
            </Link>
            .
          </p>
        </div>
      )}
      <p className="mt-8 text-sm text-slate-500">
        Need help? Check <code>docs/DB.md</code> for setup steps.
      </p>
    </main>
  );
}
