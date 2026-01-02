import SiteHeader from "@/components/nav/site-header";
import Hero from "@/components/landing/hero";
import TrustStrip from "@/components/landing/trust-strip";
import HowItWorks from "@/components/landing/how-it-works";
import FeatureCards from "@/components/landing/feature-cards";
import EmployerPath from "@/components/landing/employer-path";
import { isMeiliConfigured } from "@/lib/search/meili";
import { isStripeConfigured } from "@/lib/billing/stripe";

export default function Home() {
  const meiliEnabled = isMeiliConfigured();
  const stripeEnabled = isStripeConfigured();
  const employerSignupHref = "/signup?role=employer";

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="relative overflow-hidden">
        <Hero employerSignupHref={employerSignupHref} />
        <TrustStrip showSearch={meiliEnabled} />
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
