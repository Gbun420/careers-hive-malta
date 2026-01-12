"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Sparkles,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
  Target,
  FileText,
  ListChecks,
  HelpCircle
} from "lucide-react";
import { GenerationType } from "@/lib/second-me/types";

type SecondMePanelProps = {
  jobId: string;
  isEnabled: boolean;
};

export default function SecondMePanel({ jobId, isEnabled }: SecondMePanelProps) {
  const [activeTab, setActiveTab] = useState<GenerationType>("FIT_SUMMARY");
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [outputs, setOutputs] = useState<Record<string, any>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async (type: GenerationType) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    setError(null);
    try {
      const res = await fetch("/api/ai/second-me/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, type }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        if (data.error?.code === "SECOND_ME_NOT_ENABLED") {
          throw new Error("OPT_IN_REQUIRED");
        }
        throw new Error(data.error?.message || "Generation failed");
      }
      
      setOutputs(prev => ({ ...prev, [type]: data.output }));
    } catch (err: any) {
      if (err.message === "OPT_IN_REQUIRED") {
        setError("Please enable Second Me in your settings first.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!isEnabled) return null;

  return (
    <Card className="border-brand/20 shadow-premium overflow-hidden">
      <CardHeader className="bg-brand text-white p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-black uppercase tracking-tight">Second Me</CardTitle>
              <CardDescription className="text-white/70 font-medium">AI Jobseeker Copilot</CardDescription>
            </div>
          </div>
          <Badge variant="default" className="bg-white/20 text-white border-none text-[10px] font-black uppercase tracking-widest">
            Beta
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as GenerationType)} className="w-full">
          <TabsList className="w-full justify-start h-14 bg-muted/30 rounded-none border-b border-border p-0 px-2 overflow-x-auto overflow-y-hidden scrollbar-hide">
            <TabsTrigger value="FIT_SUMMARY" className="rounded-none h-14 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-brand gap-2">
              <Target className="h-4 w-4" /> <span className="hidden sm:inline">Fit Summary</span>
            </TabsTrigger>
            <TabsTrigger value="BULLETS" className="rounded-none h-14 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-brand gap-2">
              <ListChecks className="h-4 w-4" /> <span className="hidden sm:inline">Resume Bullets</span>
            </TabsTrigger>
            <TabsTrigger value="COVER_LETTER" className="rounded-none h-14 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-brand gap-2">
              <FileText className="h-4 w-4" /> <span className="hidden sm:inline">Cover Letter</span>
            </TabsTrigger>
            <TabsTrigger value="INTERVIEW_PREP" className="rounded-none h-14 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-brand gap-2">
              <HelpCircle className="h-4 w-4" /> <span className="hidden sm:inline">Interview Prep</span>
            </TabsTrigger>
          </TabsList>

          <div className="p-6 md:p-8">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-600" />
                  <p className="text-sm font-bold text-rose-700">{error}</p>
                </div>
                {error.includes("settings") && (
                  <Button asChild size="sm" variant="outline" className="rounded-lg border-rose-200 text-rose-700 hover:bg-rose-100">
                    <Link href="/jobseeker/second-me">Settings</Link>
                  </Button>
                )}
              </div>
            )}

            <TabsContent value="FIT_SUMMARY" className="m-0 space-y-6">
              {!outputs.FIT_SUMMARY ? (
                <EmptyState 
                  title="Analyze Job Fit" 
                  description="Understand how your profile matches this role and identify potential gaps."
                  onGenerate={() => generate("FIT_SUMMARY")}
                  loading={loading.FIT_SUMMARY}
                />
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
                  <div className="p-6 rounded-2xl bg-brand/5 border border-brand/10">
                    <h4 className="font-black text-brand uppercase text-xs tracking-widest mb-2">AI Verdict</h4>
                    <p className="text-lg font-bold text-slate-900 leading-tight">{outputs.FIT_SUMMARY.headline}</p>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <h5 className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Strength Points</h5>
                      <ul className="space-y-2">
                        {outputs.FIT_SUMMARY.match_points.map((p: string, i: number) => (
                          <li key={i} className="flex gap-2 text-sm font-medium text-slate-600">
                            <Check className="h-4 w-4 text-secondary shrink-0 mt-0.5" /> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h5 className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Growth Areas</h5>
                      <ul className="space-y-2">
                        {outputs.FIT_SUMMARY.risks.map((p: string, i: number) => (
                          <li key={i} className="flex gap-2 text-sm font-medium text-slate-600">
                            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" /> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="BULLETS" className="m-0">
              {!outputs.BULLETS ? (
                <EmptyState 
                  title="Tailored Resume Bullets" 
                  description="Get 3 high-impact resume bullets written specifically for this job description."
                  onGenerate={() => generate("BULLETS")}
                  loading={loading.BULLETS}
                />
              ) : (
                <div className="space-y-4">
                  {outputs.BULLETS.bullets.map((b: string, i: number) => (
                    <div key={i} className="group relative p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all">
                      <p className="text-sm font-medium text-slate-700 pr-10">{b}</p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(b, `bullet-${i}`)}
                      >
                        {copied === `bullet-${i}` ? <Check className="h-4 w-4 text-secondary" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="COVER_LETTER" className="m-0">
              {!outputs.COVER_LETTER ? (
                <EmptyState 
                  title="Personalized Cover Letter" 
                  description="Generate a draft cover letter that bridges your experience with the employer's needs."
                  onGenerate={() => generate("COVER_LETTER")}
                  loading={loading.COVER_LETTER}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">{outputs.COVER_LETTER.subject}</h4>
                    <Button variant="outline" size="sm" className="rounded-lg h-8 gap-2" onClick={() => copyToClipboard(`${outputs.COVER_LETTER.subject}\n\n${outputs.COVER_LETTER.body}`, 'cl')}>
                      {copied === 'cl' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied === 'cl' ? "Copied" : "Copy All"}
                    </Button>
                  </div>
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{outputs.COVER_LETTER.body}</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="INTERVIEW_PREP" className="m-0">
              {!outputs.INTERVIEW_PREP ? (
                <EmptyState 
                  title="Interview Roadmap" 
                  description="Predict the questions you'll be asked and prepare your answers using the STAR method."
                  onGenerate={() => generate("INTERVIEW_PREP")}
                  loading={loading.INTERVIEW_PREP}
                />
              ) : (
                <div className="space-y-6">
                  {outputs.INTERVIEW_PREP.questions.map((q: any, i: number) => (
                    <div key={i} className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                      <div className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand text-xs font-black">{i+1}</span>
                        <p className="font-black text-slate-900">{q.q}</p>
                      </div>
                      <Separator className="bg-slate-100" />
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Strategy</p>
                        <p className="text-sm text-slate-600 font-medium">{q.why}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">STAR Prompt</p>
                        <p className="text-sm text-slate-500 italic leading-relaxed">{q.star_prompt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function EmptyState({ title, description, onGenerate, loading }: { title: string, description: string, onGenerate: () => void, loading?: boolean }) {
  return (
    <div className="py-12 flex flex-col items-center text-center space-y-6">
      <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300">
        <Sparkles className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{title}</h4>
        <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">{description}</p>
      </div>
      <Button 
        onClick={onGenerate} 
        disabled={loading}
        className="rounded-xl px-10 bg-brand text-white border-none shadow-cta h-12 gap-2"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? "Generating..." : "Generate with AI"}
      </Button>
    </div>
  );
}
