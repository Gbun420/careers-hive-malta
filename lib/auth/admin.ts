import "server-only";

const allowAdminSignup = process.env.ALLOW_ADMIN_SIGNUP === "true";
const rawAllowlist = process.env.ADMIN_ALLOWLIST ?? "";

const adminAllowlist = rawAllowlist
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

export function isAdminSignupEnabled(): boolean {
  return allowAdminSignup;
}

export function getAdminAllowlist(): string[] {
  return adminAllowlist;
}

export function isAdminAllowedEmail(email?: string | null): boolean {
  if (!allowAdminSignup) {
    return false;
  }
  if (!email) {
    return false;
  }
  return adminAllowlist.includes(email.toLowerCase());
}
