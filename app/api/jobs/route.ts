import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { getUserRole } from "@/lib/auth/roles";
import { JobCreateSchema, normalizeJobPayload, type Job } from "@/lib/jobs/schema";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { matchJobToSearch } from "@/lib/alerts/match";
import { SavedSearchCriteriaSchema } from "@/lib/alerts/criteria";
import { searchJobs, upsertJobs } from "@/lib/search/meili";
import { attachEmployerVerified, isEmployerVerified } from "@/lib/trust/verification";
import {
  attachFeaturedStatus,
  isJobFeatured,
  sortFeaturedJobs,
} from "@/lib/billing/featured";
import { isStripeConfigured } from "@/lib/billing/stripe";

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return jsonError(
      "SUPABASE_NOT_CONFIGURED",
      "Supabase is not configured.",
      503
    );
  }

  const url = new URL(request.url);
  const mine = url.searchParams.get("mine") === "true";
  const query = url.searchParams.get("q")?.trim() || undefined;
  const location = url.searchParams.get("location")?.trim() || undefined;
  const isActiveParam = url.searchParams.get("is_active");
  const isActive =
    isActiveParam !== null ? isActiveParam === "true" : true;

  if (mine) {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return jsonError("UNAUTHORIZED", "Authentication required.", 401);
    }
    const role = getUserRole(authData.user);
    if (role !== "employer") {
      return jsonError("FORBIDDEN", "Employer access required.", 403);
    }

    const { data, error } = await supabase
      .from("jobs")
      .select(
        "id, employer_id, title, description, location, salary_range, created_at, is_active"
      )
      .eq("employer_id", authData.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return jsonError("DB_ERROR", error.message, 500);
    }

    const withFeatured = await attachFeaturedStatus(data ?? []);
    const enriched = await attachEmployerVerified(withFeatured);
    return NextResponse.json({
      data: enriched,
      source: "db",
      meta: { billing_enabled: isStripeConfigured() },
    });
  }

  try {
    const meiliResult = await searchJobs({
      query,
      location,
      isActive,
    });

    if (meiliResult) {
      const withFeatured = await attachFeaturedStatus(meiliResult.hits);
      const enriched = await attachEmployerVerified(withFeatured);
      const ordered = enriched
        .map((job, index) => ({ job, index }))
        .sort((a, b) => {
          const aFeatured = isJobFeatured(a.job);
          const bFeatured = isJobFeatured(b.job);
          if (aFeatured !== bFeatured) {
            return aFeatured ? -1 : 1;
          }
          return a.index - b.index;
        })
        .map(({ job }) => job);
      return NextResponse.json({
        data: ordered,
        source: "meili",
      });
    }
  } catch (error) {
    // Best effort: fall back to DB search.
  }

  let dbQuery = supabase
    .from("jobs")
    .select(
      "id, employer_id, title, description, location, salary_range, created_at, is_active"
    );

  if (typeof isActive === "boolean") {
    dbQuery = dbQuery.eq("is_active", isActive);
  }
  if (location) {
    dbQuery = dbQuery.ilike("location", `%${location}%`);
  }
  if (query) {
    dbQuery = dbQuery.or(
      `title.ilike.%${query}%,description.ilike.%${query}%`
    );
  }

  const { data, error } = await dbQuery.order("created_at", {
    ascending: false,
  });

  if (error) {
    return jsonError("DB_ERROR", error.message, 500);
  }

  const withFeatured = await attachFeaturedStatus(data ?? []);
  const enriched = await attachEmployerVerified(withFeatured);
  const sorted = sortFeaturedJobs(enriched);
  return NextResponse.json({ data: sorted, source: "db" });
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return jsonError(
      "SUPABASE_NOT_CONFIGURED",
      "Supabase is not configured.",
      503
    );
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return jsonError("UNAUTHORIZED", "Authentication required.", 401);
  }

  const role = getUserRole(authData.user);
  if (role !== "employer") {
    return jsonError("FORBIDDEN", "Employer access required.", 403);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return jsonError("INVALID_INPUT", "Invalid JSON body.", 400);
  }

  const parsed = JobCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError("INVALID_INPUT", parsed.error.errors[0]?.message, 400);
  }

  const normalized = normalizeJobPayload(parsed.data);
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      employer_id: authData.user.id,
      title: normalized.title,
      description: normalized.description,
      location: normalized.location,
      salary_range: normalized.salary_range,
      is_active: normalized.is_active ?? true,
    })
    .select(
      "id, employer_id, title, description, location, salary_range, created_at, is_active"
    )
    .single();

  if (error) {
    return jsonError("DB_ERROR", error.message, 500);
  }

  const employerVerified = await isEmployerVerified(authData.user.id);
  const jobWithVerification = data
    ? ({ ...data, employer_verified: employerVerified } as Job)
    : null;
  const [jobWithFeatured] = jobWithVerification
    ? await attachFeaturedStatus([jobWithVerification])
    : [null];
  const jobWithEnrichment = jobWithFeatured ?? jobWithVerification;

  try {
    if (jobWithEnrichment) {
      await upsertJobs([jobWithEnrichment]);
    }
  } catch (enqueueError) {
    // Best-effort indexing only.
  }

  const serviceClient = createServiceRoleClient();
  let notificationsEnqueued = 0;
  let notificationsSkippedReason: string | null = null;

  if (!serviceClient) {
    notificationsSkippedReason = "SERVICE_ROLE_NOT_CONFIGURED";
  } else {
    try {
      const { data: searches, error: searchesError } = await serviceClient
        .from("saved_searches")
        .select("id, jobseeker_id, frequency, search_criteria")
        .eq("frequency", "instant");

      if (searchesError) {
        notificationsSkippedReason = "SAVED_SEARCH_FETCH_FAILED";
      } else if (searches && data) {
        const job = jobWithVerification ?? (data as Job);
        const matches = searches
          .map((search) => {
            const criteriaResult = SavedSearchCriteriaSchema.safeParse(
              search.search_criteria
            );
            if (!criteriaResult.success) {
              return null;
            }
            const result = matchJobToSearch(job, criteriaResult.data);
            if (!result.match) {
              return null;
            }
            return {
              user_id: search.jobseeker_id as string,
              job_id: job.id,
              saved_search_id: search.id as string,
              channel: "email",
              status: "pending",
            };
          })
          .filter(Boolean) as Array<{
          user_id: string;
          job_id: string;
          saved_search_id: string;
          channel: "email";
          status: "pending";
        }>;

        if (matches.length > 0) {
          const searchIds = matches.map((match) => match.saved_search_id);
          const { data: existing } = await serviceClient
            .from("notifications")
            .select("user_id, saved_search_id")
            .eq("job_id", job.id)
            .in("saved_search_id", searchIds);

          const existingKeys = new Set(
            (existing ?? []).map(
              (item) => `${item.user_id}:${item.saved_search_id}`
            )
          );

          const inserts = matches.filter(
            (match) =>
              !existingKeys.has(`${match.user_id}:${match.saved_search_id}`)
          );

          if (inserts.length > 0) {
            const { error: insertError } = await serviceClient
              .from("notifications")
              .insert(inserts);
            if (insertError) {
              notificationsSkippedReason = "NOTIFICATION_INSERT_FAILED";
            } else {
              notificationsEnqueued = inserts.length;
            }
          }
        }
      }
    } catch (enqueueError) {
      notificationsSkippedReason = "NOTIFICATION_ENQUEUE_FAILED";
    }
  }

  return NextResponse.json(
    {
      data: jobWithEnrichment ?? data,
      notifications_enqueued: notificationsEnqueued,
      notifications_skipped_reason: notificationsSkippedReason,
    },
    { status: 201 }
  );
}
