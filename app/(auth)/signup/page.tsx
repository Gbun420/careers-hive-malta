import { Suspense } from "react";
import SignupForm from "@/components/auth/signup-form";
import { getAdminAllowlist, isAdminSignupEnabled } from "@/lib/auth/admin";

export default function SignupPage() {
  const allowAdminSignup = isAdminSignupEnabled();
  const adminAllowlist = allowAdminSignup ? getAdminAllowlist() : [];

  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6 py-16 text-sm text-slate-600">
          Loading sign-up...
        </div>
      }
    >
      <SignupForm
        allowAdminSignup={allowAdminSignup}
        adminAllowlist={adminAllowlist}
      />
    </Suspense>
  );
}
