"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Building2, Briefcase, ArrowRight } from "lucide-react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/browser";
import CheckoutButton from "@/components/billing/CheckoutButton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Careers.mt",
  description: "Simple, transparent pricing for employers in Malta.",
};

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
      price: "Free",
      description: "Perfect for testing the platform or occasional hiring.",
      features: [
        "1 Standard Job Posting",
        "Basic Applicant Tracker",
        "Community Support",
        "Standard Visibility",
      ],
      cta: "Get Started",
      href: "/signup?role=employer",
      highlight: false,
    },
    {
      name: "Professional",
      price: "€9.99",
      period: "/month",
      description: "Unlimited hiring with priority support and tools.",
      features: [
        "Unlimited Job Postings",
        "Full ATS Integration",
        "Priority Search Placement",
        "Applicant Matching (AI)",
        "Premium Support",
      ],
      cta: "Go Professional",
      product: "PRO_SUB" as const,
      highlight: true,
    },
    {
      name: "Single Post",
      price: "€4.99",
      period: "/post",
      description: "One-time premium listing for specific urgent roles.",
      features: [
        "7 Days Featured Status",
        "Instant Email Alerts",
        "Social Media Promotion",
        "Malta-wide Coverage",
      ],
      cta: "Post Now",
      product: "JOB_POST" as const,
      highlight: false,
    },
  ];

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto space-y-16">
        <header className="text-center space-y-4">
          <Badge variant="verified" className="px-4 py-1 text-xs uppercase font-black tracking-widest">Pricing for Employers</Badge>
          <SectionHeading
            title="Accelerate your hiring in Malta"
            subtitle="Choose the plan that fits your growth. From single urgent roles to scaling your entire team."
          />
        </header>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col rounded-[2.5rem] border-2 transition-all duration-300 hover:shadow-xl ${
                plan.highlight
                  ? "border-brand shadow-premium scale-105 z-10"
                  : "border-slate-100 hover:border-brand/20"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-cta">
                  Most Popular
                </div>
              )}
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-2xl font-black text-slate-900 uppercase tracking-tightest">
                  {plan.name}
                </CardTitle>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-brand">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm font-bold text-slate-400">{plan.period}</span>
                  )}
                </div>
                <p className="mt-4 text-sm font-medium text-slate-500 leading-relaxed italic">
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-1 flex flex-col">
                <div className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-emerald-600" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {!loadingAuth ? (
                  plan.product && user ? (
                    <CheckoutButton 
                      product={plan.product} 
                      companyId={user.id}
                      className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-xs border-none bg-brand text-white shadow-cta"
                    >
                      {plan.cta} <ArrowRight className="h-4 w-4 ml-2" />
                    </CheckoutButton>
                  ) : (
                    <Button
                      asChild
                      className={`w-full rounded-2xl h-14 font-black uppercase tracking-widest text-xs border-none ${
                        plan.highlight
                          ? "bg-brand text-white shadow-cta"
                          : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                      }`}
                    >
                      <Link href={user ? "/employer/jobs/new" : "/signup?role=employer"} className="gap-2">
                        {plan.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  )
                ) : (
                  <Button disabled className="w-full rounded-2xl h-14 bg-slate-50 text-slate-300">
                    Checking Access...
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <footer className="bg-slate-50 rounded-[3rem] p-12 text-center border border-slate-100">
          <div className="max-w-2xl mx-auto space-y-6">
            <Building2 className="h-12 w-12 text-brand mx-auto opacity-50" />
            <h3 className="text-2xl font-black text-slate-900 uppercase">Enterprise Solutions</h3>
            <p className="text-slate-500 font-medium">
              Hiring more than 50 people per year? Get a custom quote with unlimited featured slots, multi-user accounts, and dedicated account management.
            </p>
            <Button variant="outline" size="lg" className="rounded-2xl border-brand text-brand font-black uppercase tracking-widest px-10">
              Contact Sales
            </Button>
          </div>
        </footer>
      </div>
    </PageShell>
  );
}
