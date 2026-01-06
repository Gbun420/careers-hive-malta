import { fetchDynamicMetrics } from "@/lib/metrics";
import { PageShell } from "@/components/ui/page-shell";
import HeroTwoColumn from "@/components/landing/hero-two-column";
import TrustStrip from "@/components/landing/trust-strip";
import EmployerPricingPath from "@/components/landing/employer-pricing-path";

export const dynamic = "force-dynamic";

export default async function EmployerLandingPage() {
  const metrics = await fetchDynamicMetrics({
    queries: [
      'verified_employers', 
      'placements_30day', 
      'avg_applications_per_job',
      'active_job_seekers',
      'total_job_postings',
      'alert_delivery_time',
      'verified_postings_pct',
      'retention_7day_pct'
    ],
    fallbacks: true
  });

  return (
    <PageShell className="pt-0">
      <main>
        <HeroTwoColumn metrics={metrics} />
        
        <TrustStrip showSearch={false} metrics={metrics} />

        <EmployerPricingPath 
          metrics={metrics} 
          employerSignupHref="/signup?role=employer" 
        />
      </main>
    </PageShell>
  );
}
