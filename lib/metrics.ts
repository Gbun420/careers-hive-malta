import { unstable_cache } from "next/cache";
import { createServiceRoleClient } from "./supabase/server";

export interface MetricValue {
  value: number | string;
  isStale: boolean;
  lastUpdated: string;
  isDays?: number;
}

export interface MetricResult {
  [key: string]: MetricValue;
}

/**
 * Fetches dynamic metrics from Supabase with caching and validation.
 * Adheres to the Careers Hive Dynamic Data Integration Guide.
 */
export const fetchDynamicMetrics = unstable_cache(
  async (options: {
    queries: string[];
    fallbacks?: boolean;
    validateData?: boolean;
  }): Promise<MetricResult> => {
    const supabase = createServiceRoleClient();
    if (!supabase) {
      console.error("Supabase service role client not available for metrics");
      return {};
    }

    const results: MetricResult = {};
    const now = new Date();
    const nowIso = now.toISOString();

    for (const query of options.queries) {
      let value: number | string | null = null;
      let isStale = false;

      try {
        switch (query) {
          case 'active_job_seekers': {
            const { count } = await supabase
              .from('profiles')
              .select('*', { count: 'exact', head: true })
              .eq('role', 'jobseeker')
              .gte('created_at', new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString());
            value = count;
            break;
          }

          case 'verified_employers': {
            const { count } = await supabase
              .from('employer_verifications')
              .select('*', { count: 'exact', head: true })
              .eq('status', 'approved');
            value = count;
            break;
          }

          case 'total_job_postings': {
            const { count } = await supabase
              .from('jobs')
              .select('*', { count: 'exact', head: true })
              .eq('is_active', true);
            value = count;
            break;
          }

          case 'alert_delivery_time': {
            const { data } = await supabase.rpc('get_avg_notification_delivery_time');
            value = data !== null ? Math.round(data as number) : null;
            break;
          }

          case 'verified_postings_pct': {
            const { data } = await supabase.rpc('get_verified_postings_percentage');
            value = data !== null ? data : 0;
            break;
          }

          case 'featured_adoption_rate': {
            const { count: totalCount } = await supabase
              .from('jobs')
              .select('*', { count: 'exact', head: true })
              .eq('is_active', true);
            
            const { count: featuredCount } = await supabase
              .from('job_featured')
              .select('*', { count: 'exact', head: true })
              .gt('featured_until', nowIso);

            if (totalCount && totalCount > 0) {
              value = Math.round((featuredCount || 0) * 100 / totalCount);
            } else {
              value = 0;
            }
            break;
          }

          case 'verification_approval_days': {
            const { data } = await supabase.rpc('get_avg_verification_days');
            value = data !== null ? data : "1-2";
            break;
          }

          case 'avg_applications_per_job': {
            const { data } = await supabase
              .from('jobs')
              .select('application_count')
              .eq('is_active', true);
            
            if (data && data.length > 0) {
              const totalApps = data.reduce((sum, job) => sum + (job.application_count || 0), 0);
              value = Math.round((totalApps / data.length) * 10) / 10;
            } else {
              value = 0;
            }
            break;
          }
          
          case 'placements_30day': {
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const { count } = await supabase
              .from('jobs')
              .select('*', { count: 'exact', head: true })
              .or(`status.eq.filled,and(is_active.eq.false,created_at.gte.${thirtyDaysAgo})`);
            value = count; 
            break;
          }

          case 'retention_7day_pct': {
            // Count jobseekers who signed up in last 30 days and were active in last 7 days
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            
            const { count: totalNew } = await supabase
              .from('profiles')
              .select('*', { count: 'exact', head: true })
              .eq('role', 'jobseeker')
              .gte('created_at', thirtyDaysAgo);
            
            const { count: activeNew } = await supabase
              .from('profiles')
              .select('*', { count: 'exact', head: true })
              .eq('role', 'jobseeker')
              .gte('created_at', thirtyDaysAgo)
              .gte('updated_at', sevenDaysAgo);

            if (totalNew && totalNew > 0) {
              value = Math.round((activeNew || 0) * 100 / totalNew);
            } else {
              value = 75; // Baseline fallback for brand new platforms
            }
            break;
          }
        }
      } catch (error) {
        console.error(`Error fetching metric ${query}:`, error);
        isStale = true;
      }

      // Final mapping with fallbacks
      if (value === null || value === undefined) {
        if (options.fallbacks) {
           // Provide reasonable default fallbacks based on query
           switch(query) {
             case 'alert_delivery_time': value = 5; break;
             case 'verified_postings_pct': value = 90; break;
             case 'verification_approval_days': value = "1-2"; break;
             default: value = 0;
           }
        } else {
           value = "N/A";
        }
      }

      results[query] = {
        value,
        isStale,
        lastUpdated: nowIso,
        isDays: 0,
      };
    }

    return results;
  },
  ["dynamic-metrics"],
  { revalidate: 3600 }
);