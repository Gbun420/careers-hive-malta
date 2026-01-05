import SiteHeader from "@/components/nav/site-header";
import Hero from "@/components/landing/hero";
import TrustStrip from "@/components/landing/trust-strip";
import HowItWorks from "@/components/landing/how-it-works";
import FeatureCards from "@/components/landing/feature-cards";
import EmployerPath from "@/components/landing/employer-path";
import FeaturedCarousel from "@/components/jobs/featured-carousel";
import CategoryGrid from "@/components/landing/category-grid";
import { isMeiliConfigured } from "@/lib/search/meili";
import { isStripeConfigured } from "@/lib/billing/stripe";
import { fetchDynamicMetrics } from "@/lib/metrics";

export default async function Home() {
  const meiliEnabled = isMeiliConfigured();
  const stripeEnabled = isStripeConfigured();
  const employerSignupHref = "/signup?role=employer";

  const metrics = await fetchDynamicMetrics({
    queries: [
      'active_job_seekers', 
      'total_job_postings', 
      'verified_employers', 
      'alert_delivery_time',
      'verified_postings_pct',
      'verification_approval_days'
    ],
    fallbacks: true
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="relative overflow-hidden">
        <Hero employerSignupHref={employerSignupHref} />
        <TrustStrip showSearch={meiliEnabled} metrics={metrics} />
        <FeaturedCarousel />
        <CategoryGrid />
        <FeatureCards featuredEnabled={stripeEnabled} />
        <HowItWorks />
        <EmployerPath
          featuredEnabled={stripeEnabled}
          employerSignupHref={employerSignupHref}
        />
      </main>
    </div>
  );
}
