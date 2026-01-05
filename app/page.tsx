import SiteHeader from "@/components/nav/site-header";
import Hero from "@/components/landing/hero";
import TrustStrip from "@/components/landing/trust-strip";
import CategoryGrid from "@/components/landing/category-grid";
import EmployerPricingPath from "@/components/landing/employer-pricing-path";
import FeaturedCarousel from "@/components/jobs/featured-carousel";
import { isMeiliConfigured } from "@/lib/search/meili";
import { fetchDynamicMetrics } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export default async function Home() {
  const meiliEnabled = isMeiliConfigured();
  const employerSignupHref = "/signup?role=employer";

  // Fetch metrics for landing page social proof
  const metrics = await fetchDynamicMetrics({
    queries: [
      'active_job_seekers', 
      'total_job_postings', 
      'verified_employers', 
      'alert_delivery_time',
      'verified_postings_pct',
      'featured_adoption_rate',
      'avg_applications_per_job',
      'placements_30day',
      'retention_7day_pct'
    ],
    fallbacks: true
  });

  return (
    <div className="bg-white">
      <main>
        <Hero employerSignupHref={employerSignupHref} />
        
        <TrustStrip showSearch={meiliEnabled} metrics={metrics} />
        
        <FeaturedCarousel />
        
        <CategoryGrid />
        
        <EmployerPricingPath 
          metrics={metrics} 
          employerSignupHref={employerSignupHref} 
        />
      </main>
    </div>
  );
}
