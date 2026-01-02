import SignupForm from "@/components/auth/signup-form";
import { getAdminAllowlist, isAdminSignupEnabled } from "@/lib/auth/admin";

export default function SignupPage() {
  const allowAdminSignup = isAdminSignupEnabled();
  const adminAllowlist = allowAdminSignup ? getAdminAllowlist() : [];

  return (
    <SignupForm
      allowAdminSignup={allowAdminSignup}
      adminAllowlist={adminAllowlist}
    />
  );
}
