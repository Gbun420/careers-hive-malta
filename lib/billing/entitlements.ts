import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";

export type Entitlement = {
  canPublish: boolean;
  isFeatured: boolean;
  plan: "FREE" | "PRO";
  remainingPosts: number;
};

export async function getCompanyEntitlements(companyId: string, jobId?: string): Promise<Entitlement> {
  const supabase = createServiceRoleClient();
  if (!supabase) return { canPublish: false, isFeatured: false, plan: "FREE", remainingPosts: 0 };

  // 1. Fetch from employer_entitlements (Source of Truth)
  const { data: entitlement } = await supabase
    .from("employer_entitlements")
    .select("*")
    .eq("user_id", companyId)
    .maybeSingle();

  // If no entry, user is definitely FREE with 0 posts
  if (!entitlement) {
    return { canPublish: false, isFeatured: false, plan: "FREE", remainingPosts: 0 };
  }

  const isPro = entitlement.plan === "PRO";
  const hasRemainingPosts = (entitlement.remaining_job_posts || 0) > 0;
  const isFeaturedGlobally = entitlement.featured_until ? new Date(entitlement.featured_until) > new Date() : false;

  // 2. Determine if can publish
  let canPublish = isPro || hasRemainingPosts;

  // 3. Specific Job checks (Legacy or override)
  let isJobFeatured = isFeaturedGlobally;
  
  if (jobId) {
    const { data: jobPurchase } = await supabase
      .from("stripe_purchases")
      .select("id")
      .eq("user_id", companyId)
      .eq("consumed", false) // or check if specifically tied to this jobId in metadata
      .contains("metadata", { jobId })
      .maybeSingle();
    
    if (jobPurchase) canPublish = true;
  }

  return {
    canPublish,
    isFeatured: isJobFeatured,
    plan: entitlement.plan as "FREE" | "PRO",
    remainingPosts: entitlement.remaining_job_posts || 0,
  };
}