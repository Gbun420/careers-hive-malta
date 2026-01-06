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
import { trackEvent } from "@/lib/analytics";

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
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed.");
        return;
      }

      trackEvent('signup_initiated', { role });
      setMessage("Check your email to confirm your account.");
    } catch (err) {
      console.error("Signup form error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!supabase) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16 text-center">
        <h1 className="font-display text-3xl font-black text-foreground">
          Supabase setup required
        </h1>
        <p className="mt-3 text-muted-foreground">
          Configure your environment variables before signing up.
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/setup">Go to setup</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
      <h1 className="font-display text-4xl font-black text-foreground tracking-tight">
        Create your account
      </h1>
      <p className="mt-3 text-lg font-medium text-muted-foreground">
        Choose a role to tailor your experience.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <label className="block text-sm font-bold text-foreground uppercase tracking-widest">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="name@example.com"
            className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 transition-all"
          />
        </label>
        <label className="block text-sm font-bold text-foreground uppercase tracking-widest">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            placeholder="••••••••"
            className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 transition-all"
          />
        </label>
        <label className="block text-sm font-bold text-foreground uppercase tracking-widest">
          Account Type
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 transition-all appearance-none"
          >
            {roleOptions.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </label>
        {error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
            {message}
          </p>
        ) : null}
        <Button type="submit" size="lg" disabled={loading} className="w-full rounded-xl bg-brand hover:opacity-90 shadow-cta transition-all text-white border-none">
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm font-medium text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-black text-brand hover:opacity-80 transition-colors underline decoration-2 underline-offset-4">
          Sign in
        </Link>
      </p>
    </main>
  );
}