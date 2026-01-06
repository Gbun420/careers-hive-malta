"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Trash2, Brain, Sparkles, ShieldCheck, Loader2 } from "lucide-react";

export default function SecondMeSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    enabled: false,
    tone: "professional",
    language: "en"
  });
  const [usage, setUsage] = useState(0);

  useEffect(() => {
    fetch("/api/jobseeker/second-me")
      .then(res => res.json())
      .then(data => {
        if (data.settings) setSettings(data.settings);
        setUsage(data.usage || 0);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (update: any) => {
    setSaving(true);
    try {
      const res = await fetch("/api/jobseeker/second-me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      const data = await res.json();
      if (data.data) setSettings(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure? This will disable the feature and delete ALL your AI-generated data.")) return;
    
    setSaving(true);
    try {
      await fetch("/api/jobseeker/second-me", { method: "DELETE" });
      setSettings({ enabled: false, tone: "professional", language: "en" });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageShell><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand" /></div></PageShell>;
  }

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <SectionHeading
            title="Second Me"
            subtitle="Manage your AI Jobseeker Copilot settings and privacy."
          />
        </header>

        <div className="space-y-8">
          <Card className="border-brand/20 bg-brand/5 shadow-premium overflow-hidden">
            <CardHeader className="bg-brand text-white p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Brain className="h-8 w-8" />
                  <div>
                    <CardTitle className="text-2xl font-black uppercase">Copilot Status</CardTitle>
                    <CardDescription className="text-white/80">Activate your digital twin for job applications.</CardDescription>
                  </div>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => handleUpdate({ enabled: checked })}
                  disabled={saving}
                />
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6 bg-white">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm uppercase tracking-tight">Privacy First</p>
                    <p className="text-sm text-slate-500">Your data is only used to generate application materials. We never sell your profile to third parties.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm uppercase tracking-tight">Daily Limit</p>
                    <p className="text-sm text-slate-500">You have used <span className="font-black text-brand">{usage} / 20</span> generations today.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {settings.enabled && (
            <Card className="border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Personalization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label className="font-bold uppercase text-[10px] tracking-widest text-slate-400">AI Personality Tone</Label>
                    <Select
                      value={settings.tone || "professional"}
                      onChange={(e) => handleUpdate({ tone: e.target.value })}
                      disabled={saving}
                    >
                      <option value="professional">Professional & Polished</option>
                      <option value="direct">Direct & Concise</option>
                      <option value="enthusiastic">Enthusiastic & Driven</option>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Output Language</Label>
                    <Select
                      value={settings.language}
                      onChange={(e) => handleUpdate({ language: e.target.value })}
                      disabled={saving}
                    >
                      <option value="en">English</option>
                      <option value="mt">Maltese (Beta)</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-rose-100 bg-rose-50/30">
            <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Danger Zone</p>
                  <p className="text-sm text-slate-500">Remove all AI-generated content and reset your preferences.</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 gap-2 shrink-0"
                onClick={handleDelete}
                disabled={saving}
              >
                <Trash2 className="h-4 w-4" />
                Wipe AI Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
