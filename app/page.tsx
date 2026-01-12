import Hero from "@/components/landing/Hero";
import CategoryGrid from "@/components/landing/category-grid";
import EmployerPricingPath from "@/components/landing/employer-pricing-path";
import FeaturedCarousel from "@/components/jobs/featured-carousel";

export const dynamic = "force-dynamic";

export default async function Home() {
  const employerSignupHref = "/signup?role=employer";

  return (
    <div className="bg-[#F8FAFC]">
      <main className="space-y-0">
        <Hero employerSignupHref={employerSignupHref} />
        
        <div className="py-20">
          <FeaturedCarousel />
        </div>
        
        <CategoryGrid />
        
        <div className="bg-primary py-32 mt-32">
          <EmployerPricingPath 
            employerSignupHref={employerSignupHref} 
          />
        </div>
      </main>
    </div>
  );
}
