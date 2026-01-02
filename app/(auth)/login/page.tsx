import { Suspense } from "react";
import LoginForm from "@/components/auth/login-form";
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
      <LoginForm
        allowAdminSignup={allowAdminSignup}
        adminAllowlist={adminAllowlist}
      />
    </Suspense>
  );
}
