import Hero from "@/components/landing/hero";
import TrustStrip from "@/components/landing/trust-strip";
import CategoryGrid from "@/components/landing/category-grid";
import EmployerPricingPath from "@/components/landing/employer-pricing-path";
import FeaturedCarousel from "@/components/jobs/featured-carousel";

export const dynamic = "force-dynamic";

export default async function Home() {
  const employerSignupHref = "/signup?role=employer";

  return (
    <div className="bg-background">
      <main>
        <Hero employerSignupHref={employerSignupHref} />
        
        <TrustStrip />
        
        <FeaturedCarousel />
        
        <CategoryGrid />
        
        <EmployerPricingPath 
          employerSignupHref={employerSignupHref} 
        />
      </main>
    </div>
  );
}