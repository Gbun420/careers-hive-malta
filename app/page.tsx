import SiteHeader from "@/components/nav/site-header";
import HeroTwoColumn from "@/components/landing/hero-two-column";
import FeatureGrid from "@/components/landing/feature-grid";
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
      'avg_applications_per_job'
    ],
    fallbacks: true
  });

  return (
    <div className="min-h-screen selection:bg-coral-100 selection:text-coral-900">
      <SiteHeader />
      <main>
        {/* NEW Hero with dynamic stats */}
        <HeroTwoColumn metrics={metrics} />
        
        {/* Featured carousel (hand-picked from DB) */}
        <FeaturedCarousel />
        
        {/* NEW Feature Grid for Trust & Speed */}
        <FeatureGrid metrics={metrics} showSearch={meiliEnabled} />
        
        {/* NEW Industry Explorer */}
        <CategoryGrid />
        
        {/* NEW Employer Strip & Pricing Preview */}
        <EmployerPricingPath 
          metrics={metrics} 
          employerSignupHref={employerSignupHref} 
        />
      </main>
    </div>
  );
}