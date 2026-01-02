import type { SavedSearchCriteria } from "@/lib/alerts/criteria";
import type { Job } from "@/lib/jobs/schema";

type MatchResult = {
  match: boolean;
  score: number;
  reasons: string[];
};

const normalize = (value: string) => value.toLowerCase();

const tokenize = (value: string) =>
  normalize(value)
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter(Boolean);

const extractNumbers = (value: string) =>
  value.match(/\d+/g)?.map((token) => token.trim()) ?? [];

export function matchJobToSearch(job: Job, criteria: SavedSearchCriteria): MatchResult {
  const reasons: string[] = [];
  const haystack = normalize(`${job.title} ${job.description}`);

  const activeCriteria = {
    keywords: criteria.keywords?.trim(),
    location: criteria.location?.trim(),
    categories: criteria.categories?.filter(Boolean),
    employment_type: criteria.employment_type,
    remote: criteria.remote,
    salary_range: criteria.salary_range?.trim(),
  };

  const hasAnyCriteria = Object.values(activeCriteria).some((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== undefined && value !== null && value !== "";
  });

  if (!hasAnyCriteria) {
    return { match: false, score: 0, reasons: ["No criteria set"] };
  }

  const checks: Array<{ label: string; ok: boolean }> = [];

  if (activeCriteria.keywords) {
    const tokens = tokenize(activeCriteria.keywords);
    const ok = tokens.every((token) => haystack.includes(token));
    checks.push({ label: "keywords", ok });
    if (ok) {
      reasons.push("Keywords matched");
    }
  }

  if (activeCriteria.location) {
    const location = normalize(activeCriteria.location);
    const ok = job.location ? normalize(job.location).includes(location) : false;
    checks.push({ label: "location", ok });
    if (ok) {
      reasons.push("Location matched");
    }
  }

  if (activeCriteria.categories && activeCriteria.categories.length > 0) {
    const ok = activeCriteria.categories.some((category) =>
      haystack.includes(normalize(category))
    );
    checks.push({ label: "categories", ok });
    if (ok) {
      reasons.push("Category matched");
    }
  }

  if (activeCriteria.employment_type) {
    const token = normalize(activeCriteria.employment_type.replace(/_/g, " "));
    const ok = haystack.includes(token);
    checks.push({ label: "employment_type", ok });
    if (ok) {
      reasons.push("Employment type matched");
    }
  }

  if (activeCriteria.remote) {
    const ok = haystack.includes("remote");
    checks.push({ label: "remote", ok });
    if (ok) {
      reasons.push("Remote matched");
    }
  }

  if (activeCriteria.salary_range) {
    const jobSalary = job.salary_range ? normalize(job.salary_range) : "";
    const criteriaSalary = normalize(activeCriteria.salary_range);
    const tokens = extractNumbers(criteriaSalary);
    const hasNumberMatch = tokens.length > 0 && tokens.some((token) => jobSalary.includes(token));
    const hasSubstringMatch = jobSalary.includes(criteriaSalary);
    const ok = jobSalary.length > 0 && (hasNumberMatch || hasSubstringMatch);
    checks.push({ label: "salary_range", ok });
    if (ok) {
      reasons.push("Salary range matched");
    }
  }

  const total = checks.length;
  const matched = checks.filter((check) => check.ok).length;
  const match = total > 0 ? matched === total : false;
  const score = total > 0 ? Math.round((matched / total) * 100) : 0;

  return { match, score, reasons };
}
