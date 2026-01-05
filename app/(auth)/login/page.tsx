import { Suspense } from "react";
import LoginForm from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { getAdminAllowlist, isAdminSignupEnabled } from "@/lib/auth/admin";

export default function LoginPage() {
  const allowAdminSignup = isAdminSignupEnabled();
  const adminAllowlist = allowAdminSignup ? getAdminAllowlist() : [];

  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6 py-16 text-sm text-slate-600">
          Loading sign-in...
        </div>
      }
    >
      <AuthShell 
        title="Welcome back" 
        subtitle="Sign in to manage your alerts and applications."
      >
        <LoginForm
          allowAdminSignup={allowAdminSignup}
          adminAllowlist={adminAllowlist}
        />
      </AuthShell>
    </Suspense>
  );
}
