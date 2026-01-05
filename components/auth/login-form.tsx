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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <div className="space-y-4">
        <p className="text-sm font-medium text-slate-600">
          Supabase configuration required. Please visit setup to link your database.
        </p>
        <Button asChild variant="outline" className="w-full rounded-xl">
          <Link href="/setup">Go to setup</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Work Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="name@company.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Security Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            placeholder="••••••••"
          />
        </div>
        
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
        
        <Button type="submit" size="lg" disabled={loading} className="w-full rounded-xl bg-brand-primary hover:bg-brand-primaryDark shadow-lg shadow-brand-primary/20">
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <footer className="mt-8 pt-6 border-t border-slate-50 text-center">
        <p className="text-sm text-slate-500 font-medium">
          New to Careers.mt?{" "}
          <Link
            href={`/signup${redirectedFrom ? `?redirectedFrom=${encodeURIComponent(redirectedFrom)}` : ""}`}
            className="font-black text-brand-primary hover:text-brand-primaryDark transition-colors underline decoration-2 underline-offset-4"
          >
            Create an account
          </Link>
        </p>
      </footer>
    </div>
  );
}
