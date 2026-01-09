"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Bell, Sparkles, ArrowRight, Zap } from "lucide-react";

type HeroProps = {
  employerSignupHref: string;
};

export default function Hero({ employerSignupHref }: HeroProps) {
  return (
    <section className="relative overflow-hidden gradient-hero py-16 md:py-24 lg:py-32">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-30 blur-[100px]"
          style={{ background: 'linear-gradient(135deg, hsl(191 83% 30%) 0%, hsl(187 71% 45%) 100%)' }}
        />
        <div
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-20 blur-[100px]"
          style={{ background: 'linear-gradient(135deg, hsl(38 92% 50%) 0%, hsl(45 93% 47%) 100%)' }}
        />
      </div>

      <div className="container-wide relative z-10">
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left Column - Content */}
          <div className="flex flex-col items-start text-left animate-fade-up">
            {/* Accent Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <Zap className="h-4 w-4 text-brand-accent" />
              <span className="text-sm font-semibold text-foreground">Malta&apos;s #1 Job Platform</span>
            </div>

            <h1 className="text-display text-foreground">
              Malta&apos;s High<br />
              <span className="gradient-text font-black">Performance</span><br />
              Job Feed.
            </h1>

            <p className="mt-6 text-subheading max-w-lg">
              Real-time alerts from verified Maltese employers. Apply before the competition with zero latency.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="btn-gradient flex items-center gap-2 text-lg"
                aria-label="Get instant job alerts"
              >
                Get Job Alerts <ArrowRight className="h-5 w-5" />
              </Link>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="btn-glass text-lg h-14 px-8"
              >
                <Link href="/jobs" aria-label="Browse all active jobs">Browse Jobs</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-label">
                <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-brand text-white">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                Verified Maltese Professionals
              </div>
              <div className="flex items-center gap-3 text-label">
                <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-brand text-white">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                Direct access to hiring teams
              </div>
            </div>
          </div>

          {/* Right Column - Feature Card */}
          <div className="relative group animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: 'radial-gradient(circle at center, hsl(191 83% 30% / 0.15) 0%, transparent 70%)' }} />

            {/* Glass Card */}
            <div className="relative glass-card p-8 lg:p-10">
              <div className="flex flex-col gap-8">
                {/* Feature 1 */}
                <div className="flex items-start gap-5 hover-scale">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl gradient-brand text-white shadow-lg">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Verified employers only</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Every company is manually vetted to ensure high-quality, legitimate opportunities.</p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start gap-5 hover-scale">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl gradient-accent text-white shadow-lg">
                    <Bell className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Real-time job alerts</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Get notified the second a job matching your criteria is posted. Zero latency.</p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start gap-5 hover-scale">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl gradient-brand text-white shadow-lg">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Quality-first moderation</h3>
                    <p className="mt-1 text-sm text-muted-foreground">We filter the noise so you only see the most relevant roles in the Maltese market.</p>
                  </div>
                </div>
              </div>

              {/* Footer Badge */}
              <div className="mt-10 pt-6 border-t border-border/50 flex items-center justify-center gap-2 text-label">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Zero-Latency Market Feed
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}