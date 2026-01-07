import { JobAlertFilters } from "./types";

export function getAlertSummary(query: string | null, filters: JobAlertFilters): string {
  const parts: string[] = [];

  if (query) {
    parts.push(`"${query}"`);
  }

  if (filters.location) {
    parts.push(`in ${filters.location}`);
  }

  if (filters.sector) {
    parts.push(`in ${filters.sector}`);
  }

  if (filters.employmentType) {
    parts.push(filters.employmentType.replace("_", " "));
  }

  if (filters.remote) {
    parts.push("Remote only");
  }

  if (filters.salaryMin || filters.salaryMax) {
    if (filters.salaryMin && filters.salaryMax) {
      parts.push(`€${filters.salaryMin / 1000}k - €${filters.salaryMax / 1000}k`);
    } else if (filters.salaryMin) {
      parts.push(`> €${filters.salaryMin / 1000}k`);
    } else if (filters.salaryMax) {
      parts.push(`< €${filters.salaryMax / 1000}k`);
    }
  }

  return parts.length > 0 ? parts.join(", ") : "All new jobs";
}
