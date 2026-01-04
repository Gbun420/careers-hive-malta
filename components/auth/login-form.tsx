"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@/lib/supabase/browser";
import { getDashboardPath, getUserRole } from "@/lib/auth/roles";

type LoginFormProps = {
  allowAdminSignup: boolean;
  adminAllowlist: string[];
};

export default function LoginForm({
  allowAdminSignup,
  adminAllowlist,
}: LoginFormProps) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");
  const safeRedirect =
    redirectedFrom && redirectedFrom.startsWith("/") ? redirectedFrom : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(searchParams.get("error"));
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const allowlist = useMemo(
    () => new Set(adminAllowlist.map((value) => value.toLowerCase())),
    [adminAllowlist]
  );

  const isAdminAllowed = useCallback(
    (userEmail?: string | null) => {
      if (!allowAdminSignup) {
        return false;
      }
      if (!userEmail) {
        return false;
      }
      return allowlist.has(userEmail.toLowerCase());
    },
    [allowAdminSignup, allowlist]
  );

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const checkSession = async () => {
      const { data } = await supabase.auth.getUser();
      const role = getUserRole(data.user);

      if (role === "admin" && !isAdminAllowed(data.user?.email)) {
        setError("Admin access is restricted.");
        await supabase.auth.signOut();
        return;
      }

      if (role) {
        router.replace(getDashboardPath(role));
      }
    };

    void checkSession();
  }, [supabase, router, isAdminAllowed]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Supabase is not configured. Visit /setup.");
      return;
    }

    setLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    const role = getUserRole(data.user);
    if (!role) {
      setError("Missing role metadata. Please contact support.");
      return;
    }

    if (role === "admin" && !isAdminAllowed(data.user?.email)) {
      setError("Admin access is restricted.");
      await supabase.auth.signOut();
      return;
    }

    if (safeRedirect) {
      router.replace(safeRedirect);
      return;
    }

    router.replace(getDashboardPath(role));
  };

  if (!supabase) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Supabase setup required
        </h1>
        <p className="mt-3 text-slate-600">
          Configure your environment variables before signing in.
        </p>
        <Link
          href="/setup"
          className="mt-6 inline-flex w-fit rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700"
        >
          Go to setup
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-slate-900">
        Welcome back
      </h1>
      <p className="mt-3 text-slate-600">
        Sign in to manage job alerts and postings.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none"
          />
        </label>
        {error ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        New here?{" "}
        <Link
          href={`/signup${redirectedFrom ? `?redirectedFrom=${encodeURIComponent(redirectedFrom)}` : ""}`}
          className="font-medium text-teal-700 underline"
        >
          Create an account
        </Link>
      </p>
    </main>
  );
}
