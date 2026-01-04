"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@/lib/supabase/browser";
import {
  getDashboardPath,
  isUserRole,
  roles,
  type UserRole,
} from "@/lib/auth/roles";

type SignupFormProps = {
  allowAdminSignup: boolean;
  adminAllowlist: string[];
};

export default function SignupForm({
  allowAdminSignup,
  adminAllowlist,
}: SignupFormProps) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const roleParam = searchParams.get("role");
  const [role, setRole] = useState<UserRole>(
    isUserRole(roleParam) ? roleParam : "jobseeker"
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const roleOptions = useMemo<UserRole[]>(
    () =>
      allowAdminSignup
        ? [...roles]
        : roles.filter((option) => option !== "admin"),
    [allowAdminSignup]
  );
  const allowlist = new Set(adminAllowlist.map((value) => value.toLowerCase()));

  useEffect(() => {
    if (!roleOptions.includes(role)) {
      setRole("jobseeker");
    }
  }, [roleOptions, role]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Supabase is not configured. Visit /setup.");
      return;
    }

    if (role === "admin") {
      if (!allowAdminSignup) {
        setError("Admin signup is disabled.");
        return;
      }
      if (!allowlist.has(email.toLowerCase())) {
        setError("This email is not approved for admin access.");
        return;
      }
    }

    setLoading(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
        },
        emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL 
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
          : undefined,
      },
    });
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (!data.session) {
      setMessage("Check your email to confirm your account.");
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
          Configure your environment variables before signing up.
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
        Create your account
      </h1>
      <p className="mt-3 text-slate-600">
        Choose a role to tailor your experience.
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
        <label className="block text-sm font-medium text-slate-700">
          Role
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none"
          >
            {roleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
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
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-teal-700 underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
