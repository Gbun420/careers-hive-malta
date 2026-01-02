import LoginForm from "@/components/auth/login-form";
import { getAdminAllowlist, isAdminSignupEnabled } from "@/lib/auth/admin";

export default function LoginPage() {
  const allowAdminSignup = isAdminSignupEnabled();
  const adminAllowlist = allowAdminSignup ? getAdminAllowlist() : [];

  return (
    <LoginForm
      allowAdminSignup={allowAdminSignup}
      adminAllowlist={adminAllowlist}
    />
  );
}
