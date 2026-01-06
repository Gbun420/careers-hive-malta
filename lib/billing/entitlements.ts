import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";

export type Entitlement = {
  canPublish: boolean;
  isFeatured: boolean;
  plan: "FREE" | "PRO";
};

export async function getCompanyEntitlements(companyId: string, jobId?: string): Promise<Entitlement> {
  const supabase = createServiceRoleClient();
  if (!supabase) return { canPublish: false, isFeatured: false, plan: "FREE" };

  // 1. Check Company Plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_status, current_period_end")
    .eq("id", companyId)
    .single();

  const isPro = profile?.plan === "PRO" && profile?.plan_status === "active";
  
  if (isPro) {
    return { canPublish: true, isFeatured: false, plan: "PRO" };
  }

  // 2. If not PRO, check for one-time JOB_POST purchase for this specific job
  if (jobId) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id, type")
      .eq("employer_id", companyId)
      .eq("job_id", jobId)
      .eq("status", "paid")
      .in("type", ["JOB_POST", "FEATURED_ADDON", "featured"])
      .maybeSingle();

    if (purchase) {
      return { 
        canPublish: true, 
        isFeatured: purchase.type === "FEATURED_ADDON" || purchase.type === "featured",
        plan: "FREE" 
      };
    }
  }

  return { canPublish: false, isFeatured: false, plan: "FREE" };
}
