export const roles = ["jobseeker", "employer", "admin"] as const;

export type UserRole = (typeof roles)[number];

type MetadataContainer = {
  user_metadata?: Record<string, unknown> | null;
};

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && roles.includes(value as UserRole);
}

export function getUserRole(user: MetadataContainer | null): UserRole | null {
  if (!user?.user_metadata) {
    return null;
  }

  const role = user.user_metadata.role;
  return isUserRole(role) ? role : null;
}

export function getDashboardPath(role: UserRole): string {
  return `/${role}/dashboard`;
}

export function getRoleFromPath(pathname: string): UserRole | null {
  if (pathname.startsWith("/jobseeker")) {
    return "jobseeker";
  }
  if (pathname.startsWith("/employer")) {
    return "employer";
  }
  if (pathname.startsWith("/admin")) {
    return "admin";
  }
  return null;
}
