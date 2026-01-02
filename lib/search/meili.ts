import { MeiliSearch, type Index } from "meilisearch";
import type { Job } from "@/lib/jobs/schema";

const meiliHost = process.env.MEILI_HOST;
const meiliApiKey = process.env.MEILI_API_KEY;
const meiliIndexJobs = process.env.MEILI_INDEX_JOBS ?? "jobs";
let jobsIndexConfigured = false;

export type MeiliJobDocument = Job & {
  featured_score: number;
};

export type JobsSearchResult = {
  hits: Job[];
  backend: "meili" | "db";
};

function getFeaturedScore(job: Job): number {
  if (typeof job.is_featured === "boolean") {
    return job.is_featured ? 100 : 0;
  }
  if (!job.featured_until) {
    return 0;
  }
  return new Date(job.featured_until).getTime() > Date.now() ? 100 : 0;
}

export function getMissingMeiliEnv(): string[] {
  const missing: string[] = [];
  if (!meiliHost) {
    missing.push("MEILI_HOST");
  }
  if (!meiliApiKey) {
    missing.push("MEILI_API_KEY");
  }
  if (missing.length === 0 && !process.env.MEILI_INDEX_JOBS) {
    missing.push("MEILI_INDEX_JOBS");
  }
  return missing;
}

export function isMeiliConfigured(): boolean {
  return Boolean(meiliHost && meiliApiKey && process.env.MEILI_INDEX_JOBS);
}

function createMeiliClient(): MeiliSearch | null {
  if (!isMeiliConfigured()) {
    return null;
  }

  return new MeiliSearch({ host: meiliHost!, apiKey: meiliApiKey! });
}

function getJobsIndex(client: MeiliSearch): Index<MeiliJobDocument> {
  return client.index<MeiliJobDocument>(meiliIndexJobs);
}

export async function ensureJobsIndex(index: Index<MeiliJobDocument>) {
  if (jobsIndexConfigured) {
    return;
  }
  await index.updateSearchableAttributes([
    "title",
    "description",
    "location",
  ]);
  await index.updateFilterableAttributes(["location", "is_active"]);
  await index.updateSortableAttributes(["featured_score", "created_at"]);
  jobsIndexConfigured = true;
}

export function toMeiliJobDocument(job: Job): MeiliJobDocument {
  return {
    ...job,
    featured_score: getFeaturedScore(job),
  };
}

export async function searchJobs(params: {
  query?: string;
  location?: string;
  isActive?: boolean;
  limit?: number;
}): Promise<JobsSearchResult | null> {
  const client = createMeiliClient();
  if (!client) {
    return null;
  }

  const index = getJobsIndex(client);
  await ensureJobsIndex(index);
  const filters: string[] = [];
  if (params.location) {
    const escaped = params.location.replace(/"/g, "\\\"");
    filters.push(`location = \"${escaped}\"`);
  }
  if (typeof params.isActive === "boolean") {
    filters.push(`is_active = ${params.isActive}`);
  }

  const response = await index.search(params.query ?? "", {
    filter: filters.length > 0 ? filters.join(" AND ") : undefined,
    sort: ["featured_score:desc", "created_at:desc"],
    limit: params.limit ?? 50,
  });

  const hits = response.hits.map((hit) => {
    const { featured_score, ...rest } = hit as MeiliJobDocument;
    return rest;
  });

  return { hits, backend: "meili" };
}

export async function upsertJobs(jobs: Job[]): Promise<void> {
  const client = createMeiliClient();
  if (!client) {
    return;
  }

  const index = getJobsIndex(client);
  await ensureJobsIndex(index);
  const payload = jobs.map(toMeiliJobDocument);
  const task = index.addDocuments(payload, { primaryKey: "id" });
  await task.waitTask();
}

export async function removeJobs(ids: string[]): Promise<void> {
  const client = createMeiliClient();
  if (!client) {
    return;
  }

  const index = getJobsIndex(client);
  await ensureJobsIndex(index);
  const task = index.deleteDocuments(ids);
  await task.waitTask();
}

export async function reindexJobs(jobs: Job[]): Promise<void> {
  const client = createMeiliClient();
  if (!client) {
    return;
  }

  const index = getJobsIndex(client);
  await ensureJobsIndex(index);

  const task = index.addDocuments(jobs.map(toMeiliJobDocument), {
    primaryKey: "id",
  });
  await task.waitTask();
}
