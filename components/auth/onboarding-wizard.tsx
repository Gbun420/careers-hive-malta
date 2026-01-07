"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { NativeSelect as Select } from "@/components/ui/select";
import { siteConfig } from "@/lib/site-config";
import { trackEvent } from "@/lib/analytics";
import { Check, ChevronRight, Sparkles, Bell, ShieldCheck } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/browser";

type OnboardingWizardProps = {
  allowAdminSignup: boolean;
  adminAllowlist: string[];
};

export default function OnboardingWizard({
  allowAdminSignup,
  adminAllowlist,
}: OnboardingWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Account
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const roleParam = searchParams.get("role");
  const [role, setRole] = useState(roleParam === "employer" ? "employer" : "jobseeker");

  // Step 2: Profile (Seeker) / Company (Employer)
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("Remote");
  const [headline, setHeadline] = useState("");
  
  // Employer specific
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");

  // Step 4: Preferences
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  
  // Step 5: Alerts
  const [alertFrequency, setAlertFrequency] = useState("instant");

  const totalSteps = role === "employer" ? 3 : 5;

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError("Account creation is currently unavailable. Please try again later.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Signup failed");

      trackEvent('signup_initiated', { role });
      nextStep();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async () => {
    setLoading(true);
    try {
      const payload = role === "employer" 
        ? { full_name: companyName, headline: website }
        : { full_name: fullName, headline: headline };

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) nextStep();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStep4 = () => {
    trackEvent('alert_signup_complete', { 
      industries: selectedIndustries 
    });
    nextStep();
  };

  const finishOnboarding = () => {
    const path = role === "employer" ? "/employer/dashboard" : "/jobseeker/dashboard";
    router.push(`${path}?onboarding=complete`);
  };

  const renderStepIcon = (s: number) => {
    if (step > s) return <Check className="h-4 w-4" />;
    return <span>{s}</span>;
  };

  return (
    <div className="mx-auto flex flex-col items-center justify-center py-12 px-6 lg:px-8">
      {/* Progress Stepper */}
      <div className="mb-12 flex w-full max-w-2xl items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const s = i + 1;
          return (
            <div key={s} className="flex items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                step === s ? "border-brand-accent bg-brand-accent/5 text-brand-accent ring-4 ring-brand-accent/10" : 
                step > s ? "border-brand bg-brand text-white" : "border-border text-muted-foreground"
              }`}>
                {renderStepIcon(s)}
              </div>
              {s < totalSteps && <div className={`h-0.5 w-12 sm:w-20 ${step > s ? "bg-brand" : "bg-border"}`} />}
            </div>
          );
        })}
      </div>

      <div className="w-full max-w-xl rounded-[2.5rem] border border-border bg-white p-8 shadow-premium lg:p-12">
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-6">
            <div className="space-y-2">
              <Badge variant="new">Phase 1: Identity</Badge>
              <h2 className="text-3xl font-black text-foreground">
                {role === "employer" ? "Create employer account" : "Create your account"}
              </h2>
              <p className="text-muted-foreground font-medium">Join Careers.mt to access Malta&apos;s fastest job feed.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@company.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
              </div>
            </div>
            {error && <p className="text-xs font-bold text-rose-600 uppercase tracking-widest">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full bg-brand hover:opacity-90 text-white rounded-2xl h-14 font-black border-none">
              {loading ? "Creating Account..." : "Continue"}
            </Button>
          </form>
        )}

        {step === 2 && role === "jobseeker" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Badge variant="new">Phase 2: Professional</Badge>
              <h2 className="text-3xl font-black text-foreground">Tell us about you</h2>
              <p className="text-muted-foreground font-medium">This helps us match you with verified Maltese brands.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headline">Professional Headline</Label>
                <Input id="headline" value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. Senior Frontend Engineer" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Preferred Location</Label>
                <Select 
                  id="location" 
                  value={location} 
                  onChange={e => setLocation(e.target.value)}
                >
                  {siteConfig.locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </Select>
              </div>
            </div>
            <Button onClick={handleStep2} disabled={loading || !fullName} className="w-full bg-brand hover:opacity-90 text-white rounded-2xl h-14 font-black border-none">
              Continue to Resume
            </Button>
          </div>
        )}

        {step === 2 && role === "employer" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Badge variant="new">Phase 2: Company</Badge>
              <h2 className="text-3xl font-black text-foreground">Company Profile</h2>
              <p className="text-muted-foreground font-medium">Verified details help attract top talent.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. TechCorp Malta" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://techcorp.com.mt" />
              </div>
            </div>
            <Button onClick={handleStep2} disabled={loading || !companyName} className="w-full bg-brand hover:opacity-90 text-white rounded-2xl h-14 font-black border-none">
              Continue to Verification
            </Button>
          </div>
        )}

        {step === 3 && role === "employer" && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-brand-accent/10 text-brand-accent mb-6">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-black text-foreground">Unlock Verified Badge</h2>
            <p className="text-muted-foreground font-medium leading-relaxed text-sm">
              Verified employers receive 3x more matching applicants. You can complete the verification process in your dashboard.
            </p>
            <Button onClick={finishOnboarding} className="w-full bg-brand-accent hover:opacity-90 text-white rounded-2xl h-16 font-black text-lg gap-3 shadow-cta border-none transition-all">
              Go to Dashboard <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Badge variant="new">Phase 4: Discovery</Badge>
              <h2 className="text-3xl font-black text-foreground">What are you looking for?</h2>
              <p className="text-muted-foreground font-medium">Select industries you want to receive alerts for.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {siteConfig.industries.map(ind => (
                <button
                  key={ind}
                  onClick={() => {
                    setSelectedIndustries(prev => 
                      prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]
                    );
                  }}
                  className={`rounded-xl border p-4 text-left text-xs font-bold transition-all ${
                    selectedIndustries.includes(ind) 
                      ? "border-brand-accent bg-brand-accent/5 text-brand-accent" 
                      : "border-border bg-muted/30 text-muted-foreground hover:border-brand/20"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <Button onClick={prevStep} variant="outline" className="flex-1 rounded-2xl h-14 font-black border-border">Back</Button>
              <Button 
                onClick={handleStep4} 
                disabled={selectedIndustries.length === 0}
                className="flex-[2] bg-brand hover:opacity-90 text-white rounded-2xl h-14 font-black border-none"
              >
                Set Alert Speed
              </Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Badge variant="new">Phase 5: Performance</Badge>
              <h2 className="text-3xl font-black text-foreground">Alert Frequency</h2>
              <p className="text-muted-foreground font-medium">How fast do you want to be notified of matching roles?</p>
            </div>
            
            <div className="space-y-4">
              {[
                { id: 'instant', title: 'Instant (Recommended)', desc: 'Get notified within 5 minutes of a job post.' },
                { id: 'daily', title: 'Daily Digest', desc: 'A summary of all new jobs once per day.' },
                { id: 'weekly', title: 'Weekly Update', desc: 'Low noise, once-a-week notification.' }
              ].map(freq => (
                <button
                  key={freq.id}
                  onClick={() => setAlertFrequency(freq.id)}
                  className={`w-full rounded-[1.5rem] border p-6 text-left transition-all ${
                    alertFrequency === freq.id 
                      ? "border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent/20" 
                      : "border-border bg-muted/30 hover:border-brand/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-foreground">{freq.title}</p>
                      <p className="text-xs font-medium text-muted-foreground mt-1">{freq.desc}</p>
                    </div>
                    {alertFrequency === freq.id && <Bell className="h-5 w-5 text-brand-accent fill-brand-accent/20" />}
                  </div>
                </button>
              ))}
            </div>

            <Button onClick={finishOnboarding} className="w-full bg-brand-accent hover:opacity-90 text-white rounded-2xl h-16 font-black text-lg gap-3 shadow-cta border-none transition-all">
              Complete Onboarding <Sparkles className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      <p className="mt-8 text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
        Careers.mt &copy; 2026 · Secure Onboarding
      </p>
    </div>
  );
}