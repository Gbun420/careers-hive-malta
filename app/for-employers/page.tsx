import { PageShell } from "@/components/ui/page-shell";
import EmployerHero from "@/components/landing/EmployerHero";
import TrustStrip from "@/components/landing/trust-strip";
import EmployerPricingPath from "@/components/landing/employer-pricing-path";

export const dynamic = "force-dynamic";

export default async function EmployerLandingPage() {
  return (
    <PageShell className="pt-0">
      <main>
        <EmployerHero />
        
        <TrustStrip />

        <EmployerPricingPath 
          employerSignupHref="/signup?role=employer" 
        />
      </main>
    </PageShell>
  );
}