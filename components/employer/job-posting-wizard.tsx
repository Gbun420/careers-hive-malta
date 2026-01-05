"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/lib/site-config";
import { JobCreateSchema, type JobCreate } from "@/lib/jobs/schema";
import { JobCard } from "@/components/ui/job-card";
import { Check, ChevronRight, Briefcase, MapPin, Euro, Eye, Sparkles, Send } from "lucide-react";

type WizardStep = 1 | 2 | 3 | 4;

export default function JobPostingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<JobCreate>>({
    title: "",
    description: "",
    location: "Valletta",
    salary_min: 25000,
    salary_max: 45000,
    salary_period: "yearly",
    application_method: "email",
    application_email: "",
    application_url: "",
    is_active: true
  });

  const nextStep = () => setStep(s => (s + 1) as WizardStep);
  const prevStep = () => setStep(s => (s - 1) as WizardStep);

  const updateField = (field: keyof JobCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePublish = async () => {
    setLoading(true);
    setError(null);
    try {
      const validated = JobCreateSchema.parse(formData);
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to publish");
      
      router.push(`/employer/jobs?created=1&jobId=${data.data.id}`);
    } catch (err: any) {
      setError(err.message || "Invalid job details. Please check all steps.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-8">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-12">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                step === s ? "border-coral-500 bg-coral-50 text-coral-600 ring-4 ring-coral-50" : 
                step > s ? "border-navy-950 bg-navy-950 text-white" : "border-slate-200 text-slate-400"
              }`}>
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 4 && <div className={`h-0.5 w-12 sm:w-20 ${step > s ? "bg-navy-950" : "bg-slate-100"}`} />}
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] border border-navy-100 bg-white p-8 shadow-premium lg:p-10">
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Badge variant="new">Phase 1: Basics</Badge>
                <h2 className="text-3xl font-black text-navy-950">Role & Location</h2>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold">Job Title</Label>
                  <Input 
                    value={formData.title} 
                    onChange={e => updateField('title', e.target.value)} 
                    placeholder="e.g. Senior Frontend Engineer" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Primary Location</Label>
                  <select 
                    value={formData.location} 
                    onChange={e => updateField('location', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-navy-950"
                  >
                    {siteConfig.locations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <Button onClick={nextStep} disabled={!formData.title} className="w-full bg-navy-950 hover:bg-navy-800 text-white rounded-2xl h-14 font-black">
                Next: Description
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Badge variant="new">Phase 2: Details</Badge>
                <h2 className="text-3xl font-black text-navy-950">Role Description</h2>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold">Detailed Requirements (Min 50 chars)</Label>
                  <Textarea 
                    value={formData.description} 
                    onChange={e => updateField('description', e.target.value)}
                    placeholder="Outline responsibilities, required experience, and perks..."
                    className="min-h-[250px] rounded-2xl border-slate-200"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Button onClick={prevStep} variant="outline" className="flex-1 rounded-2xl h-14 font-black">Back</Button>
                <Button onClick={nextStep} disabled={(formData.description?.length || 0) < 50} className="flex-[2] bg-navy-950 hover:bg-navy-800 text-white rounded-2xl h-14 font-black">
                  Next: Compensation
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Badge variant="new">Phase 3: Compensation</Badge>
                <h2 className="text-3xl font-black text-navy-950">Salary & Benefits</h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-widest">Min Salary (EUR)</Label>
                  <Input type="number" value={formData.salary_min} onChange={e => updateField('salary_min', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-widest">Max Salary (EUR)</Label>
                  <Input type="number" value={formData.salary_max} onChange={e => updateField('salary_max', Number(e.target.value))} />
                </div>
              </div>
              <div className="space-y-4 rounded-2xl bg-slate-50 p-6 border border-slate-100">
                <h3 className="text-sm font-black uppercase tracking-widest text-navy-950 mb-4">Application Workflow</h3>
                <div className="flex gap-6">
                  <button 
                    onClick={() => updateField('application_method', 'email')}
                    className={`flex-1 rounded-xl border p-4 text-xs font-bold transition-all ${formData.application_method === 'email' ? 'bg-navy-950 text-white border-navy-950' : 'bg-white border-slate-200'}`}
                  >Email</button>
                  <button 
                    onClick={() => updateField('application_method', 'url')}
                    className={`flex-1 rounded-xl border p-4 text-xs font-bold transition-all ${formData.application_method === 'url' ? 'bg-navy-950 text-white border-navy-950' : 'bg-white border-slate-200'}`}
                  >URL</button>
                </div>
                {formData.application_method === 'email' ? (
                  <Input value={formData.application_email} onChange={e => updateField('application_email', e.target.value)} placeholder="hr@company.com.mt" />
                ) : (
                  <Input value={formData.application_url} onChange={e => updateField('application_url', e.target.value)} placeholder="https://careers.company.com" />
                )}
              </div>
              <div className="flex gap-4">
                <Button onClick={prevStep} variant="outline" className="flex-1 rounded-2xl h-14 font-black">Back</Button>
                <Button onClick={nextStep} className="flex-[2] bg-navy-950 hover:bg-navy-800 text-white rounded-2xl h-14 font-black">
                  Final Review
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Badge variant="new">Phase 4: Confirm</Badge>
                <h2 className="text-3xl font-black text-navy-950">Review Posting</h2>
                <p className="text-slate-500 font-medium">Verify how your role will appear to candidates across Malta.</p>
              </div>
              
              {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</p>}

              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm font-medium">
                ✓ Ready for instant synchronization with alert streams.
              </div>

              <div className="flex gap-4">
                <Button onClick={prevStep} variant="outline" className="flex-1 rounded-2xl h-14 font-black">Back</Button>
                <Button onClick={handlePublish} disabled={loading} className="flex-[2] bg-coral-500 hover:bg-coral-600 text-white rounded-2xl h-14 font-black gap-2 shadow-lg shadow-coral-500/20">
                  {loading ? "Synchronizing..." : (
                    <>
                      <Send className="h-4 w-4" />
                      Publish Role
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:block space-y-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-navy-400">Live Preview</h3>
        <div className="pointer-events-none scale-95 origin-top opacity-80">
          <JobCard 
            id="preview"
            title={formData.title || "Untitled Role"}
            employerName="Your Company"
            location={formData.location || "Malta"}
            salaryRange={formData.salary_min ? `€${formData.salary_min.toLocaleString()} - €${formData.salary_max?.toLocaleString()}` : "Competitive"}
            createdAt={new Date().toISOString()}
            isVerified={true}
          />
        </div>
        <div className="rounded-2xl bg-gold-50 border border-gold-100 p-6">
          <div className="flex items-center gap-2 text-gold-700 font-black uppercase tracking-widest text-[10px] mb-3">
            <Sparkles className="h-3 w-3 fill-gold-500" />
            Priority Listing
          </div>
          <p className="text-xs font-medium text-gold-800 leading-relaxed">
            Featured jobs stay at the top of results for 7 days and reach 3x more matching candidates. You can upgrade after publishing.
          </p>
        </div>
      </div>
    </div>
  );
}
