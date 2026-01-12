const allowAdminSignup = process.env.ALLOW_ADMIN_SIGNUP === "true";
const rawAllowlist = process.env.ADMIN_ALLOWLIST ?? "";

// Enhanced email validation and security
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

const adminAllowlist = rawAllowlist
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter((email) => email && isValidEmail(email));

/**
 * Checks if an email is eligible to sign up as an admin.
 * Requires ALLOW_ADMIN_SIGNUP=true and the email to be in the ADMIN_ALLOWLIST.
 */
export function canSignupAsAdmin(email: string): boolean {
  return allowAdminSignup && adminAllowlist.includes(email.toLowerCase());
}

export function canAccessAdmin(email: string): boolean {
  return adminAllowlist.includes(email.toLowerCase());
}

/** @deprecated Use canSignupAsAdmin or canAccessAdmin */
export function isAdminSignupEnabled(): boolean {
  return allowAdminSignup;
}

/** @deprecated Use canAccessAdmin */
export function getAdminAllowlist(): string[] {
  return adminAllowlist;
}

/** @deprecated Use canAccessAdmin */
export function isAdminAllowedEmail(email?: string | null): boolean {
  if (!email) {
    return false;
  }
  return canAccessAdmin(email);
}
