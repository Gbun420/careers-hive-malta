"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, ShieldCheck, Zap, Globe, Sparkles } from "lucide-react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/browser";
import CheckoutButton from "@/components/billing/CheckoutButton";

export default function PricingPage() {
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    if (!supabase) {
      setLoadingAuth(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });
  }, [supabase]);

  const plans = [
    {
      name: "Starter",
      price: "€49",
      period: "/post",
      description: "One-time urgent listing for a specific role.",
      features: [
        "1 Standard Job Posting",
        "7 Days Featured Badge",
        "Basic Applicant Feed",
        "Manual Moderation",
      ],
      cta: "Post Once",
      product: "JOB_POST" as const,
      highlight: false,
    },
    {
      name: "Hive Pro",
      price: "€199",
      period: "/mo",
      description: "The membership of choice for Malta's fastest-growing brands.",
      features: [
        "Unlimited Active Jobs",
        "Unlimited Match AI Usage",
        "Permanent Verified Status",
        "Early Talent Access",
        "Priority Search Indexing",
      ],
      cta: "Join The Hive",
      product: "PRO_SUB" as const,
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "Scalable recruiting for Malta's market leaders.",
      features: [
        "Dedicated Account Manager",
        "ATS API Integration",
        "Custom Branding Slots",
        "White-glove Verification",
      ],
      cta: "Contact Sales",
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto space-y-20">
        <header className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest border border-secondary/20">
            <Sparkles className="h-3 w-3" />
            Pricing & Membership
          </div>
          <h1 className="font-display text-5xl md:text-7xl text-primary tracking-tightest leading-[0.9]">
            Scale Your Team <br />
            With <span className="text-secondary italic">Excellence.</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            Stop sorting through noise. Join the network that delivers high-performance 
            Maltese talent with zero friction.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col p-10 rounded-[2.5rem] transition-all duration-500 ${
                plan.highlight
                  ? "bg-primary text-white shadow-cta scale-105 z-10"
                  : "bg-white border border-slate-200 hover:border-secondary/30 shadow-sm"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-primary text-[10px] font-black uppercase tracking-widest px-6 py-1.5 rounded-full shadow-lg">
                  Most Preferred
                </div>
              )}

              <div className="space-y-6 flex-1">
                <div className="space-y-2">
                  <h3 className={`text-sm font-black uppercase tracking-widest ${plan.highlight ? 'text-secondary' : 'text-slate-400'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-5xl font-black">{plan.price}</span>
                    <span className={`text-sm font-bold opacity-60`}>{plan.period}</span>
                  </div>
                  <p className={`text-sm font-medium leading-relaxed ${plan.highlight ? 'text-slate-300' : 'text-slate-500'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="h-px w-full bg-current opacity-10" />

                <div className="space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 group">
                      <div className={`mt-1 h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-secondary/20 text-secondary' : 'bg-slate-50 text-slate-400'}`}>
                        <Check className="h-2.5 w-2.5" />
                      </div>
                      <span className={`text-[13px] font-bold ${plan.highlight ? 'text-slate-200' : 'text-slate-600'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-10">
                {!loadingAuth ? (
                  plan.product && user ? (
                    <CheckoutButton 
                      product={plan.product} 
                      companyId={user.id}
                      className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-none transition-all ${
                        plan.highlight
                          ? "bg-secondary text-primary hover:bg-secondary/90 shadow-cta"
                          : "bg-primary text-white hover:bg-primary/90"
                      }`}
                    >
                      {plan.cta} <ArrowRight className="h-3 w-3 ml-2" />
                    </CheckoutButton>
                  ) : (
                    <Button
                      asChild
                      className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-none transition-all ${
                        plan.highlight
                          ? "bg-secondary text-primary hover:bg-secondary/90 shadow-cta"
                          : "bg-primary text-white hover:bg-primary/90"
                      }`}
                    >
                      <Link href={user ? "/employer/jobs/new" : "/signup?role=employer"} className="gap-2">
                        {plan.cta}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  )
                ) : (
                  <Button disabled className="w-full h-14 rounded-2xl bg-slate-100 text-slate-300">
                    Syncing...
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Brand Promise Bento */}
        <div className="grid md:grid-cols-3 gap-6 pt-10">
           <div className="bg-white p-8 rounded-[2rem] border border-slate-200 space-y-4 shadow-sm hover-lift">
              <ShieldCheck className="h-8 w-8 text-secondary" />
              <h4 className="font-display text-xl font-black text-primary uppercase">Verified Network</h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Every employer and job seeker is manually vetted to ensure market quality.</p>
           </div>
           <div className="bg-white p-8 rounded-[2rem] border border-slate-200 space-y-4 shadow-sm hover-lift">
              <Zap className="h-8 w-8 text-secondary" />
              <h4 className="font-display text-xl font-black text-primary uppercase">AI Matching</h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Our semantic engine matches candidates based on skills, not just keywords.</p>
           </div>
           <div className="bg-white p-8 rounded-[2rem] border border-slate-200 space-y-4 shadow-sm hover-lift">
              <Globe className="h-8 w-8 text-secondary" />
              <h4 className="font-display text-xl font-black text-primary uppercase">Local Expertise</h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Deeply rooted in the Maltese business ecosystem with first-party data.</p>
           </div>
        </div>
      </div>
    </div>
  );
}