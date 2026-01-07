"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

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

  if (loading || !profile) return null;

  const checks = [
    { label: "Identity", complete: !!profile.full_name },
    { label: "Headline", complete: !!profile.headline },
    { label: "Bio", complete: !!profile.bio },
    { label: "Skills", complete: (profile.skills?.length || 0) > 0 },
  ];

  const score = Math.round((checks.filter(c => c.complete).length / checks.length) * 100);

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-navy-400">Match Readiness</h3>
        <span className="text-xl font-black text-navy-950">{score}%</span>
      </div>
      
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div 
          className="h-full bg-coral-500 transition-all duration-1000 ease-out" 
          style={{ width: `${score}%` }} 
        />
      </div>

      <ul className="mt-6 space-y-3">
        {checks.map(check => (
          <li key={check.label} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            {check.complete ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            ) : (
              <Circle className="h-3 w-3 text-slate-200" />
            )}
            <span className={check.complete ? "text-navy-950" : "text-slate-400"}>
              {check.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
