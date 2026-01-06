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

  // Fetch only necessary metrics for landing page sections
  const metrics = await fetchDynamicMetrics({
    queries: [
      'verified_postings_pct',
      'alert_delivery_time',
      'retention_7day_pct',
      'placements_30day',
      'verified_employers'
    ],
    fallbacks: true
  });

  return (
    <div className="bg-background">
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
