import "server-only";
import { SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_LIMIT = 20;

export async function checkAndIncrementRateLimit(
  supabase: SupabaseClient,
  userId: string
): Promise<{ ok: boolean; limit?: number; remaining?: number }> {
  const day = new Date().toISOString().split("T")[0];
  const limit = process.env.SECOND_ME_RATE_LIMIT_PER_DAY 
    ? parseInt(process.env.SECOND_ME_RATE_LIMIT_PER_DAY) 
    : DEFAULT_LIMIT;

  // UPSERT increment
  const { data, error } = await supabase.rpc("increment_second_me_usage", {
    target_user_id: userId,
    target_day: day
  });

  // If RPC not defined yet, we'll implement a fallback select/update
  if (error) {
    console.warn("RPC increment_second_me_usage failed, using fallback", error);
    
    const { data: usage } = await supabase
      .from("second_me_usage_daily")
      .select("count")
      .eq("user_id", userId)
      .eq("day", day)
      .maybeSingle();

    const currentCount = usage?.count || 0;
    if (currentCount >= limit) {
      return { ok: false, limit, remaining: 0 };
    }

    await supabase
      .from("second_me_usage_daily")
      .upsert({ user_id: userId, day, count: currentCount + 1 });

    return { ok: true, limit, remaining: limit - (currentCount + 1) };
  }

  const newCount = data as number;
  if (newCount > limit) {
    return { ok: false, limit, remaining: 0 };
  }

  return { ok: true, limit, remaining: limit - newCount };
}
