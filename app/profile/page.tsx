"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/ui/page-shell";
import { User, Mail, Shield, ArrowLeft, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Profile = {
  id: string;
  role: string;
  full_name?: string;
  headline?: string;
  bio?: string;
  skills?: string[];
  created_at: string;
  email: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      if (response.ok) {
        setProfile(data.data);
        setFullName(data.data.full_name || "");
      } else {
        setError(data.error?.message || "Failed to load profile");
      }
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName.trim() || undefined,
          headline: profile?.headline?.trim() || undefined,
          bio: profile?.bio?.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setProfile(data.data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error?.message || "Failed to update profile");
      }
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-2xl py-20 space-y-8 animate-pulse">
          <div className="h-10 w-48 bg-slate-100 rounded-xl" />
          <div className="h-64 bg-slate-100 rounded-[2.5rem]" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl py-12 space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-down">
          <div className="space-y-2">
            <Link
              href="/jobseeker/dashboard"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand transition-colors mb-4"
            >
              <ArrowLeft className="h-3 w-3" /> Back to Command
            </Link>
            <h1 className="text-4xl font-black tracking-tightest text-slate-950 uppercase">
              Professional <span className="gradient-text">Profile</span>.
            </h1>
            <p className="text-lg font-medium text-slate-500">
              Your digital identity on Malta&apos;s premier career network.
            </p>
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-brand/5 text-brand outline outline-1 outline-brand/10">
            <User className="h-10 w-10" />
          </div>
        </header>

        {success && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-secondary/5 px-5 py-4 text-sm font-bold text-secondary animate-scale-in">
            <CheckCircle2 className="h-5 w-5" />
            Profile updated successfully!
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 px-5 py-4 text-sm font-bold text-rose-700 animate-shake">
            {error}
          </div>
        )}

        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <form onSubmit={handleUpdate} className="space-y-8 animate-fade-up">
            <div className="glass-card rounded-[2.5rem] border-border/40 p-8 space-y-8">
              <div className="flex items-center gap-3 border-b border-border/40 pb-6">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <Shield className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-950">Identity Details</h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Account Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      className="h-14 pl-12 rounded-2xl bg-slate-50/50 border-slate-200/50 text-slate-500 font-medium cursor-not-allowed italic"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Display Name</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-brand transition-colors" />
                    <Input
                      id="full_name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="h-14 pl-12 rounded-2xl border-slate-200 bg-white hover:border-brand/40 focus:border-brand focus:ring-brand/5 transition-all text-slate-950 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-border/40 pb-6 pt-4">
                <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-950">Professional Branding</h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="headline" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Professional Headline</Label>
                  <Input
                    id="headline"
                    value={profile?.headline || ""}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, headline: e.target.value } : null)}
                    placeholder="e.g. Senior Frontend Engineer | React & Next.js"
                    className="h-14 px-6 rounded-2xl border-slate-200 bg-white hover:border-brand/40 focus:border-brand transition-all font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Professional Bio</Label>
                  <textarea
                    id="bio"
                    value={profile?.bio || ""}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                    placeholder="Tell your professional story..."
                    className="w-full min-h-[120px] p-6 rounded-3xl border border-slate-200 bg-white hover:border-brand/40 focus:border-brand transition-all text-sm font-medium resize-none"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" variant="premium" className="w-full h-14 rounded-2xl" disabled={updating}>
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Professional Data...
                    </>
                  ) : "Save Professional Profile"}
                </Button>
              </div>
            </div>
          </form>

          <aside className="space-y-8 animate-fade-left" style={{ animationDelay: '0.1s' }}>
            <div className="glass-card rounded-[2.5rem] border-border/40 p-8 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-brand/5 blur-3xl group-hover:bg-brand/10 transition-colors" />
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-brand animate-pulse" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-950">AI Visibility</h3>
              </div>
              <p className="text-xs font-medium text-slate-500 leading-relaxed italic">
                Profiles with full names and verified emails are 40% more likely to be matched with premium Maltese employers.
              </p>
              <div className="pt-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Visibility Active
                </div>
              </div>
            </div>

            <div className="rounded-[2.5rem] bg-slate-950 p-8 text-white space-y-4 shadow-2xl">
              <h4 className="font-black italic text-sm uppercase tracking-widest">Audit Trail</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                Every profile modification is cryptographically logged for security.
              </p>
              <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/10 rounded-xl" asChild>
                <Link href="/admin/audit-logs">View History</Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
