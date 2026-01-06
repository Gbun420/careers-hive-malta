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
        <AuthShell 
          title="Welcome back" 
          subtitle="Sign in to manage your alerts and applications."
        >
          <div className="space-y-4">
            <div className="h-10 w-full skeleton rounded-xl" />
            <div className="h-10 w-full skeleton rounded-xl" />
            <div className="h-12 w-full skeleton rounded-xl mt-6" />
          </div>
        </AuthShell>
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
