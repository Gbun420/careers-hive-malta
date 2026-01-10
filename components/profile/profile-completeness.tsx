"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type Profile = {
  full_name: string | null;
  headline: string | null;
  bio: string | null;
  skills: string[] | null;
};

export default function ProfileCompleteness() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then(res => res.json())
      .then(payload => setProfile(payload.data))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !profile) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
          <div className="h-6 w-12 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-2 w-full animate-pulse rounded-full bg-slate-100" />
      </div>
    );
  }

  const checks = [
    { label: "Identity", complete: !!profile.full_name },
    { label: "Headline", complete: !!profile.headline },
    { label: "Bio", complete: !!profile.bio },
    { label: "Skills", complete: (profile.skills?.length || 0) > 0 },
  ];

  const score = Math.round((checks.filter(c => c.complete).length / checks.length) * 100);

  return (
    <div className="bg-white/40 backdrop-blur-xl p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-950">
            Profile <span className="text-brand">Strength</span>
          </h3>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
            Match Readiness Score
          </p>
        </div>
        <span className="text-3xl font-black text-slate-950 italic tracking-tighter">{score}%</span>
      </div>

      <div className="relative h-2.5 w-full rounded-full bg-slate-100/50 overflow-hidden border border-slate-200/50">
        <div
          className="h-full bg-brand transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(var(--brand-rgb),0.3)]"
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        {checks.map(check => (
          <div
            key={check.label}
            className={cn(
              "flex items-center gap-3 p-3 rounded-2xl border transition-all",
              check.complete
                ? "bg-white border-emerald-100 text-slate-950"
                : "bg-slate-50/50 border-slate-100 text-slate-400"
            )}
          >
            {check.complete ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <Circle className="h-4 w-4 text-slate-200" />
            )}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
